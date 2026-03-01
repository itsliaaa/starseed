import { nexray } from '../../lib/Request.js'

export default {
   command: 'iqc',
   category: 'maker',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} hello`)
         m.react('🕒')
         const data = await nexray('maker/iqc', {
            text
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