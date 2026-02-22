import { nexray } from '../../lib/Request.js'

export default {
   command: 'capcut',
   category: 'downloader',
   async run(m, {
      sock,
      isPrefix,
      command,
      args
   }) {
      try {
         if (!args[0])
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} https://www.capcut.com/watch/7178705274797067521?use_new_ui=0&template_id=7178705274797067521&share_token=66f8a56d-93a8-4339-a46f-795a2416809c&enter_from=template_detail&region=ID&language=in&platform=copy_link&is_copy_link=1/`)
         if (!args[0].includes('capcut.com'))
            return m.reply('❌ Invalid URL.')
         m.react('🕒')
         const data = await nexray('downloader/capcut', {
            url: args[0]
         })
         if (!data.status)
            return m.reply('❌ Failed to get data.')
         sock.sendMedia(m.chat, data.result.url, data.result.title, m)
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}