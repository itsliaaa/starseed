import { faa, nexray } from '../../lib/Request.js'
import { uguu } from '../../lib/Scraper.js'
import { bratSticker, bratVideoSticker, fetchAsBuffer } from '../../lib/Utilities.js'

export default {
   command: ['brathd', 'bratvidhd'],
   category: 'maker',
   async run (m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} i'm here`)
         if (text.length > 150)
            return m.reply('❌ Maximum 150 characters.')
         m.react('🕒')
         const isImage = command === 'brathd'
         const filePath = await (
            isImage ?
               bratSticker(text) :
               bratVideoSticker(text)
         )
         const upload = await uguu(
            await fetchAsBuffer(filePath)
         )
         const endpoint = isImage ?
            nexray :
            faa
         const path = isImage ?
            'tools/remini' :
            'hdvid'
         const data = await endpoint(path, {
            url: upload
         })
         sock.sendMedia(m.chat, data.result?.download_url || data, '', m, {
            sticker: true
         })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   premium: true,
   limit: 1
}