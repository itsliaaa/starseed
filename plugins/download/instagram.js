import { instagram } from '../../lib/Scraper.js'
import { isURL, resizeImage } from '../../lib/Utilities.js'

export default {
   command: 'instagram',
   hidden: 'ig',
   category: 'download',
   async run(m, {
      sock,
      isPrefix,
      command,
      args
   }) {
      try {
         if (!args[0])
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} https://www.instagram.com/p/CK0tLXyAzEI/`)
         if (!isURL(args[0]))
            return m.reply('❌ Invalid URL.')
         m.react('🕒')
         const data = await instagram(args[0])
         if (!data.media.length)
            return m.reply('❌ Failed to get data.')
         if (data.media.length <= 2) {
            const resized =
               data.media[0].type === 'image' ?
                  await resizeImage(data.media[0].url, 720) :
                  data.media[0].url
            return sock.sendMedia(m.chat, resized, '', m)
         }
         sock.sendMessage(m.chat, {
            album: data.media.map(media => {
               if (media.type === 'audio') return
               return ({
                  [media.type]: {
                     url: media.url
                  }
               })
            })
               .filter(Boolean)
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