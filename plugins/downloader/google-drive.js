import { nexray } from '../../lib/Request.js'

export default {
   command: 'gdrive',
   category: 'downloader',
   async run(m, {
      sock,
      isPrefix,
      command,
      args
   }) {
      try {
         if (!args[0])
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} https://drive.google.com/file/d/1YTD7Ymux9puFNqu__5WPlYdFZHcGI3Wz/view?usp=drivesdk/`)
         if (!args[0].includes('drive.google'))
            return m.reply('❌ Invalid URL.')
         m.react('🕒')
         const data = await nexray('downloader/googledrive', {
            url: args[0]
         })
         if (!data.status)
            return m.reply('❌ Failed to get data.')
         sock.sendMedia(m.chat, data.result.url, data.result.name, m)
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}