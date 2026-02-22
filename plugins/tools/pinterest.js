import { nexray } from '../../lib/Request.js'
import { shuffleArray } from '../../lib/Utilities.js'

export default {
   command: 'pinimg',
   category: 'tools',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} Fern x Stark`)
         m.react('🕒')
         const data = await nexray('search/pinterest', {
            q: text
         })
         if (!data.status)
            return m.reply('❌ Failed to get data.')
         const album = shuffleArray(data.result).splice(0, 3)
         sock.sendMessage(m.chat, {
            album: album.map((media) => ({
               [media.type]: {
                  url: media.videos_url || media.images_url
               }
            }))
         }, {
            quoted: m
         })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}