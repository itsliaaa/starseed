import { isJidNewsletter } from '@itsliaaa/baileys'

import { nexray } from '../../lib/Request.js'
import { isURL } from '../../lib/Utilities.js'

export default {
   command: ['ytmp3', 'ytmp4'],
   hidden: ['yta', 'ytv'],
   category: 'download',
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
         const shouldAsAudio = command === 'ytmp3' || command === 'yta'
         const path = shouldAsAudio ?
            'ytmp3' :
            'v1/ytmp4'
         const data = await nexray('downloader/' + path, {
            url: args[0]
         })
         if (!data.status)
            return m.reply('❌ Failed to get data.')
         sock.sendMedia(m.chat, data.result.url, data.result.title, m, {
            audio: shouldAsAudio,
            ptt: shouldAsAudio && isJidNewsletter(m.chat)
         })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}