import { deline } from '../../lib/Request.js'
import { randomInteger } from '../../lib/Utilities.js'

export default {
   command: 'fakexnxx',
   category: 'maker',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         const [caption, name = m.pushName] = text.split('|')
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} brother!? | itsliaaa`)
         m.react('🕒')
         const data = await deline('maker/fake-xnxx', {
            name,
            quote: caption,
            likes: randomInteger(100, 1000),
            dislikes: randomInteger(1, 10)
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