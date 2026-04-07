/**
 * This file is part of the Starseed Bot WhatsApp project, solely developed and maintained by Lia Wynn.
 * https://github.com/itsliaaa/starseed
 *
 * All rights reserved.
 *
 * - You are NOT allowed to copy, rewrite, modify, redistribute, or reuse this file in any form.
 * - You are NOT allowed to claim this file or any part of this project as your own.
 * - This credit notice must NOT be removed or altered.
 * - This file may ONLY be used within the Starseed project.
 */

import { G_US, LID, SECOND, SCHEMA, STATUS_REACTIONS } from './Constants.js'
import { Serialize, shouldUpdatePresence, StickerCommand } from './Serialize.js'
import { fetchAsBuffer, findTopSuggestions, frame, greeting, isEmptyObject, messageLogger, randomValue, ExtendSocket, toTime } from './Utilities.js'
import { CommandIndex, EventIndex } from './Watcher.js'

export default (db, store) => {
   let sock = null,
      setting = db.getSetting()

   return {
      bind: (socket) => {
         if (!socket) return

         sock = socket

         return ExtendSocket(sock, {
            updatePresence: setting.typingPresence,
            delayWithPresence: setting.slowMode,
            secureMetaServiceLabel: setting.secureLabel
         })
      },
      call: async ({ callerPn, from, id, status }) => {
         setting = db.getSetting()

         if (!setting.rejectCall) return

         if (status === 'offer') {
            let callFrom = callerPn || from
            if (callFrom?.endsWith(LID)) {
               const result = await sock.findUserId(callFrom)
               if (!callFrom.phoneNumber.startsWith('id'))
                  callFrom = result.phoneNumber
            }

            const userData = db.getUser(callFrom)

            await sock.rejectCall(id, from)

            if (
               !userData ||
               callFrom.startsWith(ownerNumber)
            ) return

            if (userData.callAttempt >= 3) {
               await sock.sendText(callFrom, '⚠️ You have called multiple times. Your account will now be blocked.')
               return sock.updateBlockStatus(callFrom, 'block')
            }

            ++userData.callAttempt

            sock.sendText(callFrom, '⚠️ Do not call again, or you will be blocked.')
         }
      },
      message: async (m) => {
         setting = db.getSetting()

         const timestampMs = Date.now()
         const timestampSec = timestampMs / SECOND

         if (!m.message || timestampSec - m.messageTimestamp > ignoreOldMessageTS) return

         Serialize(sock, store, setting, m)

         if (!m.type || store.hasMessage(m)) return

         StickerCommand(m, setting.stickerCommand)

         const body = m.body,
            isPrefix = m.prefix,
            command = m.command,
            text = m.text,
            args = m.args,
            isHasPrefix = m.isHasPrefix

         messageLogger(m)

         let groupMetadata = store.getGroup(m.chat)

         let user = db.getUser(m.sender)
         let group = db.getGroup(m.chat)

         store.setMessage(m)

         if (!user) {
            user = {
               ...SCHEMA.User,
               jid: m.sender,
               lid: m.senderLid,
               name: m.pushName
            }

            db.updateUser(m.sender, user)
         }

         if (!user.jid)
            user.jid = m.sender

         if (!user.lid)
            user.lid = m.senderLid

         user.name = m.pushName
         user.lastSeen = timestampMs

         if (m.isGroup) {
            if (!groupMetadata?.participants) {
               groupMetadata = await sock.groupMetadata(m.chat)
               store.setGroup(m.chat, groupMetadata)
            }

            if (!group) {
               group = {
                  ...SCHEMA.Group,
                  id: m.chat,
                  name: groupMetadata.subject
               }

               db.updateGroup(m.chat, group)
            }

            group.name = groupMetadata.subject
            group.lastActivity = timestampMs

            if (group.participants[m.sender]) {
               group.participants[m.sender].messages++
               group.participants[m.sender].lastSeen = timestampMs
            }
            else
               group.participants[m.sender] = {
                  ...SCHEMA.Participant,
                  messages: 1,
                  lastSeen: timestampMs
               }

            if (!isEmptyObject(user.afkContext)) {
               const print = frame('HELLO', [
                  `💭 System detects activity from @${user.jid.split('@')[0]} after being offline for: ${toTime(timestampMs - user.afkTimestamp)}`,
                  `🏷️ *Reason*: ${user.afkReason || '-'}`
               ], '👀')
               await sock.sendText(m.chat, print, user.afkContext)
               user.afkReason = ''
               user.afkContext = {}
               user.afkTimestamp = -1
            }
         }

         const fileSize = m.msg?.fileLength?.low || 0
         if (m.isMe) {
            setting.messageEgress++
            setting.byteEgress += fileSize
            return
         }
         else {
            setting.messageIngress++
            setting.byteIngress += fileSize
         }

         const isOwner = m.fromMe || m.sender.startsWith(ownerNumber)
         const isPartner = isOwner || setting.partner.includes(m.sender)
         const isBanned = user.banned
         const isAdmin = m.isGroup &&
            groupMetadata.participants?.some(participant =>
               (
                  participant.phoneNumber === m.sender ||
                  participant.id === m.senderLid
               ) && participant.admin
            )
         const isBotAdmin = m.isGroup &&
            groupMetadata.participants?.some(participant =>
               participant.id === sock.user.decodedLid && participant.admin
            )

         const isSelf = setting.self
         const isGroupOnly = setting.groupOnly
         const isNoPrefix = setting.noPrefix

         const shouldFindTopSuggestions = setting.commandSuggestions
         const shouldReadMessage = setting.readMessage
         const shouldReactStatus = setting.reactStatus

         if (!isOwner && isSelf) return

         if (m.isPrivate && !isPartner && isGroupOnly) return

         if (
            !m.fromMe &&
            shouldReadMessage &&
            shouldUpdatePresence(m.message)
         )
            await sock.readMessages([m.key])

         if (
            m.isStatus &&
            m.type !== 'protocolMessage' &&
            !m.fromMe &&
            shouldReactStatus
         )
            return m.react(randomValue(STATUS_REACTIONS), {
               statusJidList: [m.sender]
            })

         if (m.isGroup && !isAdmin && group.adminOnly) return

         if (m.isGroup && group.mute && command !== 'unmute') return

         let plugin = null
         if (isHasPrefix || isNoPrefix)
            plugin = CommandIndex.get(command)

         if (plugin) {
            if (isBanned && command !== 'profile')
               return m.reply('🚫 You are being banned by BOT staff.')

            const isCommandDisabled = setting.disabledCommand.includes(command)
            if (isCommandDisabled)
               return m.reply('❌ This feature is currently disabled.')

            if (plugin.owner && !isOwner)
               return m.reply('⚠️ This command only for owner.')

            if (plugin.partner && !isPartner)
               return m.reply('⚠️ This command only for partner.')

            if (plugin.group && !m.isGroup)
               return m.reply('⚠️ This command will only work in group.')

            if (plugin.private && !m.isPrivate)
               return m.reply('⚠️ This command will only work in private chat.')

            if (plugin.admin && !isAdmin)
               return m.reply('⚠️ This command only for group admin.')

            if (plugin.botAdmin && !isBotAdmin)
               return m.reply('⚠️ This command will work when bot become an admin.')

            if (plugin.limit && !isPartner) {
               if (user.limit < 1)
                  return m.reply(`⚠️ You reached the limit and will be reset at 00.00 or try \`${isPrefix}claim\` command to claim limit.`)

               const limitCost =
                  plugin.limit === true ?
                     1 :
                     typeof plugin.limit === 'number' ?
                        plugin.limit :
                        0

               if (user.limit >= limitCost) {
                  if (Math.random() < 0.10) {
                     user.maxLimit += 1
                     m.reply('🎉 Congratulations! Your storage limit has been increased by 1.')
                  }
                  user.limit -= limitCost
               }
               else
                  return m.reply(`⚠️ Your limit is not enough to use this feature, try \`${isPrefix}claim\` command to claim limit.`)
            }

            user.commandUsage++

            plugin.run(m, {
               sock,
               db,
               store,
               user,
               group,
               setting,
               body,
               groupMetadata,
               isOwner,
               isPartner,
               isBanned,
               isAdmin,
               isBotAdmin,
               isPrefix,
               command,
               text,
               args
            })
         }
         else {
            let suggestions = null
            if (shouldFindTopSuggestions && isHasPrefix)
               suggestions = findTopSuggestions(command)

            if (suggestions && suggestions.length) {
               const printSuggestions = frame('DID YOU MEAN', suggestions.map(suggestion =>
                  `${isPrefix + suggestion.command} (${suggestion.similarity.toFixed(0)}%)`
               ), '🔍')
               return m.reply(printSuggestions)
            }

            for (const event of EventIndex) {
               if (!event?.run) continue

               if (isBanned) continue

               if (event.owner && !isOwner) continue

               if (event.partner && !isPartner) continue

               if (event.group && !m.isGroup) continue

               if (event.private && !m.isPrivate) continue

               if (event.admin && !isAdmin) continue

               if (event.botAdmin && !isBotAdmin) continue

               event.run(m, {
                  sock,
                  db,
                  store,
                  user,
                  group,
                  setting,
                  body,
                  groupMetadata,
                  isOwner,
                  isPartner,
                  isBanned,
                  isAdmin,
                  isBotAdmin,
                  isPrefix,
                  command,
                  text,
                  args
               })
            }
         }
      },
      participant: async ({ id, author, participant, action }) => {
         const group = db.getGroup(id)
         const metadata = store.getGroup(id) || (await sock.groupMetadata(id))

         const isMuted = group.mute
         const isBotAdmin = metadata.participants?.some(participant =>
            participant.id === sock.user.decodedLid && participant.admin
         )

         let userId = participant.phoneNumber
         if (author?.endsWith(LID)) {
            const result = await sock.findUserId(author)
            if (!result.phoneNumber.startsWith('id'))
               author = result.phoneNumber
         }
         if (!userId) {
            const result = await sock.findUserId(participant.id)
            if (!result.phoneNumber.startsWith('id'))
               userId = result.phoneNumber
         }
         if (action === 'add') {
            metadata.participants.push(participant)

            if (!group.participants[userId])
               group.participants[userId] = {
                  ...SCHEMA.Participant
               }

            if (
               group.antiRejoin &&
               group.participants[userId].leftGroup &&
               isBotAdmin
            ) {
               await sock.sendText(id, `❌ You @${userId.split('@')[0]} already left this group before. Rejoining is not allowed.`)
               return sock.groupParticipantsUpdate(id, [userId], 'remove')
            }

            if (group.welcome && !isMuted) {
               const profilePicture = await sock.profilePicture(userId)

               const printWelcome = (group.welcomeMessage || `👋🏻 Welcome +tag`)
                  .replace('+group', metadata.subject)
                  .replace('+tag', '@' + userId.split('@')[0])

               sock.sendText(id, printWelcome, null, {
                  externalAdReply: {
                     title: botName,
                     body: greeting(),
                     thumbnail: await fetchAsBuffer(profilePicture),
                     largeThumbnail: true
                  }
               })
            }
         }
         else if (action === 'promote') {
            metadata.participants.find(x => x.id === participant.id).admin = 'admin'

            if (!isMuted)
               sock.sendText(id, `🎉 @${userId.split('@')[0]} promoted to admin by @${author.split('@')[0]}.`)
         }
         else if (action === 'demote') {
            metadata.participants.find(x => x.id === participant.id).admin = null

            if (!isMuted)
               sock.sendText(id, `⬇️ @${userId.split('@')[0]} was demoted from admin by @${author.split('@')[0]}.`)
         }
         else if (action === 'remove') {
            if (sock.user.decodedId === userId) {
               db.deleteGroup(id)
               store.deleteGroup(id)
            }
            else {
               metadata.participants = metadata.participants.filter(x => x.id !== participant.id)

               if (!group.participants[userId])
                  group.participants[userId] = {
                     ...SCHEMA.Participant
                  }

               group.participants[userId].leftGroup = author === userId
            }

            if (group.left && !isMuted) {
               const profilePicture = await sock.profilePicture(userId)

               const printLeft = (group.leftMessage || `👋🏻 Good bye! +tag`)
                  .replace('+group', metadata.subject)
                  .replace('+tag', '@' + userId.split('@')[0])

               sock.sendText(id, printLeft, null, {
                  externalAdReply: {
                     title: botName,
                     body: greeting(),
                     thumbnail: await fetchAsBuffer(profilePicture),
                     largeThumbnail: true
                  }
               })
            }
         }
         store.setGroup(id, metadata)
      },
      presence: async ({ id, presence, presences }) => {
         if (presence.endsWith(G_US)) return

         const userId = await sock.findUserId(presence)
         if (
            !userId.phoneNumber ||
            sock.user.decodedId === userId.phoneNumber
         ) return

         const userData = db.getUser(userId.phoneNumber)
         if (!userData) return

         const condition = presences[presence]
         if (
            (
               condition.lastKnownPresence === 'composing' ||
               condition.lastKnownPresence === 'recording'
            ) &&
            !isEmptyObject(userData.afkContext)
         ) {
            const print = frame('HELLO', [
               `💭 System detects activity from @${userData.jid.split('@')[0]} after being offline for: ${toTime(Date.now() - userData.afkTimestamp)}`,
               `🏷️ *Reason*: ${userData.afkReason || '-'}`
            ], '👀')
            await sock.sendText(id, print, userData.afkContext)
            userData.afkReason = ''
            userData.afkContext = {}
            userData.afkTimestamp = -1
         }
      },
      unbind: () => {
         if (!sock) return

         sock.ev.flush()
         sock.ev.removeAllListeners()
         sock.ws.close()

         sock = null
      }
   }
}