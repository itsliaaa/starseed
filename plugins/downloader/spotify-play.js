import { nexray } from '../../lib/Request.js'
import { fetchAsBuffer } from '../../lib/Utilities.js'

export default {
   command: 'spotplay',
   category: 'downloader',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} abnormal heat`)
         m.react('🕒')
         const data = await nexray('downloader/spotifyplay', {
            q: text
         })
         if (!data.status)
            return m.reply('❌ Failed to get data.')
         sock.sendMedia(m.chat, data.result.download_url, '', m, {
            audio: true,
            externalAdReply: {
               title: data.result.title,
               body: '✍🏻 Artist: ' + data.result.artist,
               thumbnail: await fetchAsBuffer(data.result.thumbnail || botThumbnail),
               url: data.result.url,
               sourceUrl: data.result.url,
               largeThumbnail: true
            }
         })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}