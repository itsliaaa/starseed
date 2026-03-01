import { nexray } from '../../lib/Request.js'
import { uguu } from '../../lib/Scraper.js'
import { fetchAsBuffer } from '../../lib/Utilities.js'

export default {
   command: 'fakestory',
   category: 'maker',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         const [caption, username = m.pushName] = text.split('|')
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} nice gurl | @itsliaaa`)
         m.react('🕒')
         const profilePicture = await sock.profilePicture(m.sender)
         const upload = await uguu(
            await fetchAsBuffer(profilePicture)
         )
         const data = await nexray('maker/fakestory', {
            username,
            caption,
            avatar: upload
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