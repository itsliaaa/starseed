import { nexray } from '../../lib/Request.js'
import { uguu } from '../../lib/Scraper.js'
import { isMimeImage } from '../../lib/Utilities.js'

export default {
   command: 'smeme',
   category: 'maker',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         const q = m.quoted?.url ? m.quoted : m
         const mimetype = (q.msg || q).mimetype
         if (!isMimeImage(mimetype))
            return m.reply('💭 Provide an image to create sticker.')
         const [top = '', bottom = ''] = text.split('|')
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} nice | gurl`)
         m.react('🕒')
         const upload = await uguu(
            await q.download()
         )
         const data = await nexray('maker/smeme', {
            text_atas: top,
            text_bawah: bottom,
            background: upload
         })
         if (!Buffer.isBuffer(data))
            return m.reply('❌ Failed to get data.')
         sock.sendMedia(m.chat, data, '', m, { sticker: true })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}