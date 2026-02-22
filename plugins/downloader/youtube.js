import { nexray } from '../../lib/Request.js'
import { isURL } from '../../lib/Utilities.js'

export default {
   command: ['ytmp3', 'ytmp4'],
   category: 'downloader',
   async run(m, {
      sock,
      isPrefix,
      command,
      args
   }) {
      try {
         if (!args[0])
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} https://youtube.com/shorts/dgXZ-Y3eZ8s?si=YILjBYzqvAhNM6oJ`)
         if (!isURL(args[0]))
            return m.reply('❌ Invalid URL.')
         m.react('🕒')
         const path = command === 'ytmp4' ?
            'v1/ytmp4' :
            'ytmp3'
         const data = await nexray('downloader/' + path, {
            url: args[0]
         })
         if (!data.status)
            return m.reply('❌ Failed to get data.')
         sock.sendMedia(m.chat, data.result.url, data.result.title, m, {
            audio: command === 'ytmp3'
         })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}