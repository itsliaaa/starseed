import { delay, isPnUser } from '@itsliaaa/baileys'

import { FAKE_QUOTE } from '../../lib/Constants.js'
import { fetchAsBuffer, frame, greeting, isMimeWebP } from '../../lib/Utilities.js'

const DEFAULT_BROADCAST_COOLDOWN = 10000

export default {
   command: ['broadcast', 'broadcastgc'],
   hidden: ['bc', 'bcgc', 'jpm'],
   category: 'owner',
   async run(m, {
      db,
      store,
      setting,
      sock,
      command,
      text
   }) {
      try {
         const q = m.quoted?.url ? m.quoted : m
         const mimetype = (q.msg || q).mimetype
         const body = text ?? q?.body
         if (!body)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} fresh updates!`)
         m.react('🕒')
         const isPrivate = command === 'broadcast' ||
            command === 'bc' ||
            command === 'jpm'
         const isGroup = command === 'broadcastgc' || command === 'bcgc'
         const bufferMedia = await q.download?.()
         const printBody = frame('BROADCAST', body.split(/\r?\n/), '📣')
         const ids = []
         if (isPrivate) {
            const alreadyInside = new Set()
            for (const userId of db.users.keys())
               if (isPnUser(userId))
                  ids.push(userId)
            for (const group of store.groupMetadata.values()) {
               const participants = group.participants
               for (let i = 0, length = participants.length; i < length; i++) {
                  const phoneNumber = participants[i].phoneNumber
                  if (phoneNumber && !alreadyInside.has(phoneNumber)) {
                     alreadyInside.add(phoneNumber)
                     ids.push(phoneNumber)
                  }
               }
            }
         }
         else if (isGroup)
            for (const id of store.groupMetadata.keys())
               ids.push(id)
         else
            ids.push(sock.user.decodedId)
         const broadcastCooldown =
            setting.broadcastCooldown >= 1000 ?
               setting.broadcastCooldown :
               DEFAULT_BROADCAST_COOLDOWN
         for (const id of ids) {
            if (bufferMedia)
               await sock.sendMedia(id, bufferMedia, printBody, FAKE_QUOTE, {
                  sticker: isMimeWebP(mimetype),
                  mentionAll: true,
                  contextInfo: {
                     isForwarded: true,
                     forwardingScore: 999
                  }
               })
            else
               await sock.sendText(id, printBody, FAKE_QUOTE, {
                  mentionAll: true,
                  contextInfo: {
                     isForwarded: true,
                     forwardingScore: 999
                  },
                  externalAdReply: {
                     title: botName,
                     body: greeting(),
                     thumbnail: await fetchAsBuffer('./lib/Media/broadcast.jpg'),
                     largeThumbnail: true
                  }
               })
            await delay(broadcastCooldown)
         }
         m.reply(`✅ Successfully sent broadcast to ${ids.length} chats.`)
      }
      catch (error) {
         console.error(e)
         m.reply('❌ ' + error.message)
      }
   },
   owner: true
}