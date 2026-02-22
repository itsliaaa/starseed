import { nexray } from '../../lib/Request.js'

export default {
   command: 'emojito',
   hidden: 'emogif',
   category: 'tools',
   async run(m, {
      sock,
      isPrefix,
      command,
      args
   }) {
      try {
         if (!args[0])
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} 😁`)
         m.react('🕒')
         const data = await nexray('tools/emojigif', {
            emoji: args[0]
         })
         sock.sendMedia(m.chat, data, '', m, { sticker: true })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}