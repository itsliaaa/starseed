import { nexray } from '../../lib/Request.js'

export default {
   command: ['playvideo', 'ptv'],
   category: 'downloader',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} mayonaka`)
         m.react('🕒')
         const data = await nexray('downloader/ytplayvid', {
            q: text
         })
         if (!data.status)
            return m.reply('❌ Failed to get data.')
         sock.sendMedia(m.chat, data.result.download_url, data.result.title, m, {
            ptv: command === 'ptv'
         })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}