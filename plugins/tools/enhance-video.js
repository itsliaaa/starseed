import { faa } from '../../lib/Request.js'
import { uguu } from '../../lib/Scraper.js'
import { isMimeVideo } from '../../lib/Utilities.js'

export default {
   command: 'hdvid',
   hidden: 'enhancevid',
   category: 'tools',
   async run(m, {
      sock,
      isPrefix,
      command
   }) {
      try {
         const q = m.quoted ? m.quoted : m
         const mimetype = q.msg?.mimetype
         if (!isMimeVideo(mimetype))
            return m.reply('💭 Provide an video to enhance it.')
         m.react('🕒')
         const upload = await uguu(
            await q.download()
         )
         const data = await faa('hdvid', {
            url: upload
         })
         sock.sendMedia(m.chat, data.result?.download_url, '', m)
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   premium: true,
   limit: 1
}