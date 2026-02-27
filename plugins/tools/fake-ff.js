import { nexray } from '../../lib/Request.js'

export default {
   command: 'fakeff',
   category: 'tools',
   async run(m, {
      sock,
      isPrefix,
      command,
      args
   }) {
      try {
         if (!args[0])
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} itsliaaa`)
         m.react('🕒')
         const data = await nexray('maker/fakelobyff', {
            nickname: args[0]
         })
         sock.sendMedia(m.chat, data, '', m)
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}