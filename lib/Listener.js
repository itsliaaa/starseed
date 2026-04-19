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

import { FAKE_QUOTE, G_US, LID, SECOND, SCHEMA, STATUS_REACTIONS } from './Constants.js'
import { Serialize, shouldUpdatePresence, StickerCommand } from './Serialize.js'
import { fetchAsBuffer, findTopSuggestions, formatTime, frame, greeting, isEmptyObject, messageLogger, randomValue, ExtendSocket, toTime } from './Utilities.js'
import { CommandIndex, EventIndex } from './Watcher.js'

import Scheduler from './Components/Scheduler.js'

const IgnoreProtocolTypes = new Set([5, 6, 9, 17])

export default (db, store) => {
   let sock = null,
      scheduler = null,
      setting = db.getSetting()

   return {
      bind: (socket) => {
         if (!socket) return

         sock = socket

         scheduler = Scheduler({
            db,
            notify: async (type, data, remaining) => {
               if (
                  !sock?.sendText ||
                  !setting.notifier
               ) return

               if (type === 'user')
                  sock.sendText(data.jid, `📣 Your premium access will expire in *${toTime(remaining)}*`, FAKE_QUOTE)
               else if (type === 'group')
                  sock.sendText(data.id, `📣 Bot's active period for this group will expire in ${toTime(remaining)}`, FAKE_QUOTE, { mentionAll: true })

               await store.writeToFile()
               await db.writeToFile()
            },
            expire: async (type, data) => {
               if (
                  !sock?.sendText ||
                  !setting.notifier
               ) return

               if (type === 'user')
                  sock.sendText(data.jid, '📣 Your premium access has expired.', FAKE_QUOTE)
               else if (type === 'group') {
                  await sock.sendText(data.id, '📣 Bot\'s active period for this group has expired.', FAKE_QUOTE, { mentionAll: true })
                  await sock.groupLeave(data.id)
                  store.deleteGroup(data.id)
                  db.deleteGroup(data.id)
               }

               await store.writeToFile()
               await db.writeToFile()
            }
         })

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
      message: async (message) => {
         setting = db.getSetting()

         const timestampMs = Date.now()
         const timestampSec = timestampMs / SECOND

         if (!message.message || timestampSec - message.messageTimestamp > ignoreOldMessageTS) return

         const m = Serialize(sock, store, setting, message)

         const msg = m.msg

         const protocolType = msg.type
         if (
            !m.type ||
            IgnoreProtocolTypes.has(protocolType) ||
            store.hasMessage(m)
         ) return

         store.setMessage(m)

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

         const isOwner = m.fromMe || m.sender.startsWith(ownerNumber)
         const isPartner = isOwner || setting.partner.includes(m.sender)
         const isPremium = isPartner || user.premiumExpiry > 0
         const isBanned = user.banned

         const isSelf = setting.self
         const isGroupOnly = setting.groupOnly
         const isNoPrefix = setting.noPrefix

         const shouldFindTopSuggestions = setting.commandSuggestions
         const shouldReadMessage = setting.readMessage
         const shouldReactStatus = setting.reactStatus

         let isAdmin = false,
            isBotAdmin = false

         if (m.isGroup) {
            if (!groupMetadata || !groupMetadata.participants) {
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

            let memberData = group.participants[m.sender]
            let botMemberData = group.participants[sock.user.decodedId]

            if (botMemberData) {
               botMemberData.messages++
               botMemberData.lastSeen = timestampMs

               isBotAdmin = botMemberData.isAdmin
            }
            else {
               const participants = groupMetadata.participants

               for (let i = 0, participantsLength = participants.length; i < participantsLength; i++) {
                  const participant = participants[i]

                  if (participant.admin) {
                     if (!isBotAdmin && participant.id === sock.user.decodedLid)
                        isBotAdmin = true

                     if (isBotAdmin) break
                  }
               }

               group.participants[sock.user.decodedId] = {
                  ...SCHEMA.Participant,
                  isAdmin: isBotAdmin,
                  messages: 1,
                  lastSeen: timestampMs
               }
            }

            if (memberData) {
               memberData.messages++
               memberData.lastSeen = timestampMs

               isAdmin = memberData.isAdmin
            }
            else {
               const participants = groupMetadata.participants

               for (let i = 0, participantsLength = participants.length; i < participantsLength; i++) {
                  const participant = participants[i]

                  if (participant.admin) {
                     if (
                        !isAdmin &&
                        (
                           participant.phoneNumber === m.sender ||
                           participant.id === m.senderLid
                        )
                     )
                        isAdmin = true

                     if (isAdmin) break
                  }
               }

               memberData = group.participants[m.sender] = {
                  ...SCHEMA.Participant,
                  isAdmin,
                  messages: 1,
                  lastSeen: timestampMs
               }
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

            if (protocolType == 3)
               groupMetadata.ephemeralDuration = msg.ephemeralExpiration
         }

         let fileSize = 0

         const fileLength = msg.fileLength
         if (fileLength && fileLength.low)
            fileSize = fileLength.low

         if (m.isMe) {
            setting.messageEgress++
            setting.byteEgress += fileSize
            return
         }

         setting.messageIngress++
         setting.byteIngress += fileSize

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

            if (plugin.premium && !isPremium)
               return m.reply('⚠️ This command only for premium.')

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

               if (user.limit >= limitCost)
                  user.limit -= limitCost
               else
                  return m.reply(`⚠️ Your limit is not enough to use this feature, try \`${isPrefix}claim\` command to claim limit.`)
            }

            if (plugin.energy && !isPartner) {
               if (user.energy < 1)
                  return m.reply(`⚠️ You're running out of energy and will be filled at 00.00 or try \`${isPrefix}chargeenergy\` command to fill up your energy.`)

               const energyCost =
                  plugin.energy === true ?
                     1 :
                     typeof plugin.energy === 'number' ?
                        plugin.energy :
                        0

               if (user.energy >= energyCost)
                  user.energy -= energyCost
               else
                  return m.reply(`⚠️ Your energy is not enough to play the game, try \`${isPrefix}chargeenergy\` command to fill up your energy.`)
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
               isPremium,
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

               if (event.premium && !isPremium) continue

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
                  isPremium,
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
         const timestampMs = Date.now()

         let group = db.getGroup(id)
         let groupMetadata = store.getGroup(id)

         if (!groupMetadata || !groupMetadata.participants) {
            groupMetadata = await sock.groupMetadata(id)
            store.setGroup(id, groupMetadata)
         }

         if (!group) {
            group = {
               ...SCHEMA.Group,
               id,
               name: groupMetadata.subject
            }

            db.updateGroup(id, group)
         }

         group.name = groupMetadata.subject
         group.lastActivity = timestampMs

         if (author?.endsWith(LID)) {
            const result = await sock.findUserId(author)
            if (!result.phoneNumber.startsWith('id'))
               author = result.phoneNumber
         }

         let userId = participant.phoneNumber
         if (!userId) {
            const result = await sock.findUserId(participant.id)
            if (!result.phoneNumber.startsWith('id'))
               userId = result.phoneNumber
         }

         let memberData = group.participants[userId]
         if (!memberData)
            memberData = group.participants[userId] = {
               ...SCHEMA.Participant
            }

         const isMuted = group.mute
         let isBotAdmin = memberData.isAdmin

         if (action === 'add') {
            groupMetadata.participants.push(participant)

            if (
               group.antiRejoin &&
               memberData.leftGroup &&
               isBotAdmin
            ) {
               await sock.sendText(id, `❌ You @${userId.split('@')[0]} already left this group before. Rejoining is not allowed.`)
               return sock.groupParticipantsUpdate(id, [userId], 'remove')
            }

            if (group.welcome && !isMuted) {
               const profilePicture = await sock.profilePicture(userId)

               const printWelcome = (group.welcomeMessage || `👋🏻 Welcome +tag`)
                  .replace('+group', groupMetadata.subject)
                  .replace('+tag', '@' + userId.split('@')[0])
                  .replace('+date', formatTime(undefined, timestampMs))

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
            groupMetadata.participants.find(x => x.id === participant.id).admin = 'admin'
            memberData.isAdmin = true

            if (!isMuted)
               sock.sendText(id, `🎉 @${userId.split('@')[0]} promoted to admin by @${author.split('@')[0]}.`)
         }
         else if (action === 'demote') {
            groupMetadata.participants.find(x => x.id === participant.id).admin = null
            memberData.isAdmin = false

            if (!isMuted)
               sock.sendText(id, `⬇️ @${userId.split('@')[0]} was demoted from admin by @${author.split('@')[0]}.`)
         }
         else if (action === 'remove') {
            if (sock.user.decodedId === userId) {
               store.deleteGroup(id)
               db.deleteGroup(id)
            }
            else {
               groupMetadata.participants = groupMetadata.participants.filter(x => x.id !== participant.id)
               memberData.leftGroup = author === userId
            }

            if (group.left && !isMuted) {
               const profilePicture = await sock.profilePicture(userId)

               const printLeft = (group.leftMessage || `👋🏻 Good bye! +tag`)
                  .replace('+group', groupMetadata.subject)
                  .replace('+tag', '@' + userId.split('@')[0])
                  .replace('+date', formatTime(undefined, timestampMs))

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

         await db.writeToFile()
         await store.writeToFile()
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
         clearInterval(scheduler)

         if (!sock) return

         sock.ev.flush()
         sock.ev.removeAllListeners()
         sock.ws.close()

         sock = null
      }
   }
}