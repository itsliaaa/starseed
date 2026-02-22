import { nekolabs } from '../../lib/Request.js'

export default {
   command: 'pin',
   category: 'downloader',
   async run(m, {
      sock,
      isPrefix,
      command,
      args
   }) {
      try {
         if (!args[0])
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} https://pin.it/5fXaAWE/`)
         if (!args[0].includes('pin.it'))
            return m.reply('❌ Invalid URL.')
         m.react('🕒')
         const data = await nekolabs('downloader/pinterest', {
            url: args[0]
         })
         if (!data.success)
            return m.reply('❌ Failed to get data.')
         sock.sendMedia(m.chat, data.result.medias.at(-1).url, '', m)
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}