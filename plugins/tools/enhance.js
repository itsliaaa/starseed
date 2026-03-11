import { nexray } from '../../lib/Request.js'
import { uguu } from '../../lib/Scraper.js'
import { isMimeImage, isMimeVideo } from '../../lib/Utilities.js'

export default {
   command: 'hd',
   hidden: 'enhance',
   category: 'tools',
   async run(m, {
      sock,
      isPrefix,
      command
   }) {
      try {
         const q = m.quoted?.url ? m.quoted : m
         const mimetype = (q.msg || q).mimetype
         if (!isMimeImage(mimetype) && !isMimeVideo(mimetype))
            return m.reply('💭 Provide an image or video to enhance it.')
         m.react('🕒')
         const upload = await uguu(
            await q.download()
         )
         const isVideo = isMimeVideo(mimetype)
         const path = isVideo ?
            'v1/hdvideo' :
            'remini'
         const params = { url: upload }
         if (isVideo)
            params.resolusi = 'full-hd'
         const data = await nexray('tools/' + path, params)
         sock.sendMedia(m.chat, data.result || data, '', m)
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}