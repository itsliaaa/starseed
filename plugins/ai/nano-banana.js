import { faa } from '../../lib/Request.js'
import { uguu } from '../../lib/Scraper.js'
import { isMimeImage } from '../../lib/Utilities.js'

export default {
   command: 'editimage',
   hidden: 'nanobanana',
   category: 'ai',
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
            return m.reply('💭 Provide an image to edit it.')
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} add eye glasses!`)
         m.react('🕒')
         const upload = await uguu(
            await q.download()
         )
         const data = await faa('nano-banana', {
            url: upload,
            prompt: text
         })
         if (!Buffer.isBuffer(data))
            return m.reply('❌ Failed to get data.')
         sock.sendMedia(m.chat, data, '', m)
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}