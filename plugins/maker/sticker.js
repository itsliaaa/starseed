import { isMimeImage, isMimeVideo } from '../../lib/Utilities.js'

export default {
   command: 'sticker',
   hidden: ['stc', 'svid', 'stiker'],
   category: 'maker',
   async run (m, {
      sock,
      command,
      text
   }) {
      try {
         const q = m.quoted?.url ? m.quoted : m
         const mimetype = (q.msg || q).mimetype
         if (!isMimeImage(mimetype) && !isMimeVideo(mimetype))
            return m.reply('💭 Reply media to make it as sticker.')
         m.react('🕒')
         sock.sendMedia(m.chat, await q.download(), '', m, {
            sticker: true
         })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}