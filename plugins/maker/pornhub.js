import { zenzxz } from '../../lib/Request.js'

export default {
   command: 'pornhub',
   category: 'maker',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         const [text1, text2] = text.split('|')
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} Star | seed`)
         m.react('🕒')
         const data = await zenzxz('maker/pornhub', {
            text1,
            text2
         })
         if (!data.status)
            return m.reply('❌ Failed to get data.')
         sock.sendMedia(m.chat, data.result.url, '', m)
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}