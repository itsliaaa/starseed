import { deline, nexray } from '../../lib/Request.js'

export default {
   command: ['attp', 'ttp'],
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
         const endpoint = command === 'attp' ?
            deline :
            nexray
         const data = await endpoint('maker/' + command, {
            text
         })
         if (!Buffer.isBuffer(data))
            return m.reply('❌ Failed to get data.')
         sock.sendMedia(m.chat, data, '', m, {
            sticker: true
         })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}