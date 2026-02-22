import { nexray } from '../../lib/Request.js'

export default {
   command: 'carbonify',
   category: 'tools',
   async run(m, {
      sock,
      isPrefix,
      command,
      text: code
   }) {
      try {
         if (!code)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} console.log('Starseed')`)
         m.react('🕒')
         const data = await nexray('maker/codesnap', {
            code
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