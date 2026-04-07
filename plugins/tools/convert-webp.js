import { nexray } from '../../lib/Request.js'
import { uguu } from '../../lib/Scraper.js'
import { isMimeWebP, resizeImage } from '../../lib/Utilities.js'

export default {
   command: ['toimage', 'tovideo'],
   hidden: ['toimg', 'tovid'],
   category: 'tools',
   async run (m, {
      sock,
      command
   }) {
      try {
         const q = m.quoted?.url ? m.quoted : m
         const mimetype = (q.msg || q).mimetype
         if (!isMimeWebP(mimetype))
            return m.reply('💭 Reply sticker.')
         m.react('🕒')
         const buffer = await q.download()
         let data
         const isNeedVideoConvert = command === 'tovid' || command === 'tovideo'
         if (isNeedVideoConvert) {
            const upload = await uguu(buffer)
            data = await nexray('tools/converter', {
               url: upload,
               format: 'mp4'
            })
            if (!data.status)
               return m.reply('❌ Failed to get data.')
         }
         else
            data = await resizeImage(
               await q.download(),
               512
            )
         sock.sendMedia(m.chat, data?.result || data, '', m)
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}