import { catbox, uguu } from '../../lib/Scraper.js'
import { frame } from '../../lib/Utilities.js'

export default {
   command: 'tourl',
   category: 'tools',
   async run (m, {
      sock,
      command
   }) {
      try {
         const q = m.quoted?.url ? m.quoted : m
         const mimetype = (q.msg || q).mimetype
         if (!mimetype)
            return m.reply('💭 Reply media to upload.')
         m.react('🕒')
         const buffer = await q.download()
         const urls = await Promise.all([
            catbox(buffer),
            uguu(buffer)
         ])
         const print = frame('TO URL', urls.map(url => url), '💾')
         m.reply(print)
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}