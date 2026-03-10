import { isMimeWebP, isMimeAudio } from '../../lib/Utilities.js'

export default {
   command: 'rvo',
   category: 'group',
   async run(m, {
      sock
   }) {
      try {
         const q = m.quoted ? m.quoted : m
         if (!q?.viewOnce)
            return m.reply('💭 Reply view once message.')
         if (!q?.url)
            return m.reply('❌ Media URL not found.')
         sock.sendMedia(m.chat, await q.download(), q.caption || '', m, {
            sticker: isMimeWebP(q.mimetype),
            audio: isMimeAudio(q.mimetype),
            ptt: q.ptt,
            contextInfo: {
               isForwarded: true,
               forwardingScore: 1
            }
         })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ Failed to get view once message.')
      }
   },
   group: true
}