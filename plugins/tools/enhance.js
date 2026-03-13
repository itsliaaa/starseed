import { faa, nexray } from '../../lib/Request.js'
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
         const endpoint = isVideo ?
            faa :
            nexray
         const path = isVideo ?
            'hdvid' :
            'tools/remini'
         const data = await endpoint(path, {
            url: upload
         })
         sock.sendMedia(m.chat, data.result?.download_url || data, '', m)
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}