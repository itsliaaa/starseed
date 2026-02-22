import { nexray } from '../../lib/Request.js'
import { uguu } from '../../lib/Scraper.js'
import { isMimeImage } from '../../lib/Utilities.js'

export default {
   command: 'blurface',
   category: 'tools',
   async run(m, {
      sock,
      isPrefix,
      command
   }) {
      try {
         const q = m.quoted?.url ? m.quoted : m
         const mimetype = (q.msg || q).mimetype
         if (!isMimeImage(mimetype))
            return m.reply('💭 Provide an image to blur face.')
         m.react('🕒')
         const upload = await uguu(
            await q.download()
         )
         const data = await nexray('tools/blurface', {
            url: upload
         })
         sock.sendMedia(m.chat, data, '', m)
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}