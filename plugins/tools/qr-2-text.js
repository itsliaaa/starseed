import { faa } from '../../lib/Request.js'
import { uguu } from '../../lib/Scraper.js'
import { isMimeImage } from '../../lib/Utilities.js'

export default {
   command: 'qr2text',
   category: 'tools',
   async run(m, {
      sock,
      isPrefix,
      command
   }) {
      try {
         const q = m.quoted ? m.quoted : m
         const mimetype = q.msg?.mimetype
         if (!isMimeImage(mimetype))
            return m.reply('💭 Provide an image to read qr code.')
         m.react('🕒')
         const upload = await uguu(
            await q.download()
         )
         const data = await faa('qr-detect', {
            url: upload
         })
         if (!data.status)
            return m.reply('❌ Failed to get data.')
         m.reply(data.result)
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}