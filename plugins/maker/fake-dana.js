import { zenzxz } from '../../lib/Request.js'

export default {
   command: 'fakedana',
   category: 'maker',
   async run(m, {
      sock,
      isPrefix,
      command,
      args
   }) {
      try {
         if (!args[0])
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} 100000`)
         m.react('🕒')
         const data = await zenzxz('maker/fakedanav2', {
            nominal: args[0]
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