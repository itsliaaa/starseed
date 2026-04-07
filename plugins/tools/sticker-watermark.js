import { isMimeImage, isMimeVideo, isMimeWebP } from '../../lib/Utilities.js'

export default {
   command: 'swm',
   category: 'tools',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         const q = m.quoted?.url ? m.quoted : m
         const mimetype = (q.msg || q).mimetype
         if (
            !isMimeImage(mimetype) &&
            !isMimeVideo(mimetype) &&
            !isMimeWebP(mimetype)
         )
            return m.reply('💭 Reply sticker message.')
         const [packName = '', publisher = ''] = text.split('|')
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} ${stickerPackName} | ${stickerPackPublisher}`)
         m.react('🕒')
         sock.sendMedia(m.chat, await q.download(), '', m, {
            sticker: true,
            mimetype,
            stickerPackName: packName,
            stickerPackPublisher: publisher
         })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}