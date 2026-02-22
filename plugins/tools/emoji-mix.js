import { nexray } from '../../lib/Request.js'

export default {
   command: 'emojimix',
   hidden: 'mix',
   category: 'tools',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         const [emoji1, emoji2] = text.split('+')
         if (!emoji1 || !emoji2)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} 😁+😆`)
         m.react('🕒')
         const data = await nexray('tools/emojimix', {
            emoji1,
            emoji2
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