import { delay } from '@itsliaaa/baileys'

import { FAKE_QUOTE } from '../../lib/Constants.js'
import { fetchAsBuffer, frame, greeting, isMimeWebP } from '../../lib/Utilities.js'

export default {
   command: ['broadcast', 'broadcastgc'],
   hidden: ['bc', 'bcgc', 'jpm'],
   category: 'owner',
   async run(m, {
      db,
      store,
      sock,
      command,
      text
   }) {
      try {
         const q = m.quoted?.url ? m.quoted : m
         const mimetype = (q.msg || q).mimetype
         const body = text || q?.body
         if (!body)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} fresh updates!`)
         m.react('🕒')
         const isPrivate = command === 'broadcast' ||
            command === 'bc' ||
            command === 'jpm'
         const isGroup = command === 'broadcastgc' || command === 'bcgc'
         const bufferMedia = await q.download?.()
         const ids = isPrivate ?
               [...db.database.users.keys()] :
                  isGroup ?
                     Object.keys(await sock.groupFetchAllParticipating()) :
                        []
         const printBody = frame('BROADCAST', body.split(/\r?\n/), '📣')
         for (const id of ids) {
            const mentions = isGroup ?
               store.getGroup(id).participants.map(participant => participant.id) :
               [id]
            if (bufferMedia)
               await sock.sendMedia(id, bufferMedia, printBody, FAKE_QUOTE, {
                  sticker: isMimeWebP(mimetype),
                  contextInfo: {
                     isForwarded: true,
                     forwardingScore: 999,
                     mentionedJid: mentions
                  }
               })
            else
               await sock.sendText(id, printBody, FAKE_QUOTE, {
                  contextInfo: {
                     isForwarded: true,
                     forwardingScore: 999,
                     mentionedJid: mentions
                  },
                  externalAdReply: {
                     title: botName,
                     body: greeting(),
                     thumbnail: await fetchAsBuffer('./lib/Media/broadcast.jpg'),
                     largeThumbnail: true
                  }
               })
            await delay(10000)
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