import { zenzxz } from '../../lib/Request.js'

export default {
   command: 'fakedana',
   category: 'maker',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} 100000`)
         m.react('🕒')
         const path = text.includes('--crop') ?
            'fakedana' :
            'fakedanav2'
         const data = await zenzxz('maker/' + path, {
            nominal: text.replace(' ', '.')
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