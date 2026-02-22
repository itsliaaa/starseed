import { nexray } from '../../lib/Request.js'

export default {
   command: 'spotify',
   category: 'downloader',
   async run(m, {
      sock,
      isPrefix,
      command,
      args
   }) {
      try {
         if (!args[0])
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} https://open.spotify.com/intl-id/track/4sZzZNIstrMGQEnKnUFFJD`)
         if (!args[0].includes('open.spotify.com'))
            return m.reply('❌ Invalid URL.')
         m.react('🕒')
         const data = await nexray('downloader/spotify', {
            url: args[0]
         })
         if (!data.status)
            return m.reply('❌ Failed to get data.')
         sock.sendMedia(m.chat, data.result.url, '', m, {
            audio: true
         })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}