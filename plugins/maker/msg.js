import { nexray } from '../../lib/Request.js'

export default {
   command: 'msg',
   category: 'maker',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         const [message, title = 'Warning', icon = 'error'] = text.split('|')
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} hello | Notify`)
         m.react('🕒')
         const data = await nexray('maker/msg', {
            message,
            title,
            icon
         })
         if (!Buffer.isBuffer(data))
            return m.reply('❌ Failed to get data.')
         sock.sendMedia(m.chat, data, '', m)
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}