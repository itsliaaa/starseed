import { deline, nexray } from '../../lib/Request.js'

export default {
   command: ['bratanime', 'bratgirl'],
   category: 'tools',
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
         const endpoint = command === 'bratgirl' ?
            deline :
            nexray
         const path = command === 'bratgirl' ?
            'cewekbrat' :
            command
         const data = await endpoint('maker/' + path, {
            text
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