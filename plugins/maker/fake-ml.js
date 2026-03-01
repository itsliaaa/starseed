import { nexray } from '../../lib/Request.js'
import { uguu } from '../../lib/Scraper.js'
import { fetchAsBuffer } from '../../lib/Utilities.js'

export default {
   command: 'fakeml',
   category: 'maker',
   async run(m, {
      sock,
      isPrefix,
      command,
      args
   }) {
      try {
         if (!args[0])
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} itsliaaa`)
         m.react('🕒')
         const profilePicture = await sock.profilePicture(m.sender)
         const upload = await uguu(
            await fetchAsBuffer(profilePicture)
         )
         const data = await nexray('maker/fakelobyml', {
            avatar: upload,
            nickname: args[0]
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