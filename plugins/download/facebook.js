import { nexray } from '../../lib/Request.js'
import { isURL } from '../../lib/Utilities.js'

export default {
   command: ['facebook', 'fbmp3', 'fbvn'],
   hidden: 'fb',
   category: 'download',
   async run(m, {
      sock,
      isPrefix,
      command,
      args
   }) {
      try {
         if (!args[0])
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} https://www.facebook.com/share/v/17n6DAqTfJ/`)
         if (!isURL(args[0]))
            return m.reply('❌ Invalid URL.')
         m.react('🕒')
         const data = await nexray('downloader/facebook', {
            url: args[0]
         })
         if (!data.status)
            return m.reply('❌ Failed to get data.')
         sock.sendMedia(m.chat, data.result.video_hd || data.result.video_sd, '', m, {
            audio: command === 'fbmp3',
            ptt: command === 'fbvn'
         })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}