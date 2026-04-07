import { nexray } from '../../lib/Request.js'
import { isURL } from '../../lib/Utilities.js'

export default {
   command: 'twitter',
   hidden: 'tw',
   category: 'download',
   async run(m, {
      sock,
      isPrefix,
      command,
      args
   }) {
      try {
         if (!args[0])
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} https://twitter.com/mosidik/status/1475812845249957889?s=20`)
         if (!isURL(args[0]))
            return m.reply('❌ Invalid URL.')
         m.react('🕒')
         const data = await nexray('downloader/twitter', {
            url: args[0]
         })
         if (!data.status)
            return m.reply('❌ Failed to get data.')
         if (data.result.length < 2)
            return sock.sendMedia(m.chat, data.result.download_url[0].url, '', m)
         sock.sendMessage(m.chat, {
            album: data.result.download_url
               .filter(result => result.type === 'image' || result.type === 'video')
               .map(value => ({
                  [value.type]: {
                     url: value.url
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