import { nexray } from '../../lib/Request.js'

export default {
   command: 'mediafire',
   hidden: 'mf',
   category: 'download',
   async run(m, {
      sock,
      isPrefix,
      command,
      args
   }) {
      try {
         if (!args[0])
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} https://www.mediafire.com/file/1fqjqg7e8e2v3ao/YOWA.v8.87_By.SamMods.apk/file/`)
         if (!args[0].includes('mediafire.com'))
            return m.reply('❌ Invalid URL.')
         m.react('🕒')
         const data = await nexray('downloader/mediafire', {
            url: args[0]
         })
         if (!data.status)
            return m.reply('❌ Failed to get data.')
         sock.sendMedia(m.chat, data.result.download_url, '', m, {
            fileName: args[0].split('/').filter(string => string && !string.includes('file')).at(-1),
            document: true
         })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}