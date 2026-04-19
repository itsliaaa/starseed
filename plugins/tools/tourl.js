import { catbox, uguu, quax } from '../../lib/Scraper.js'
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
         const response = await Promise.allSettled([
            catbox(buffer),
            uguu(buffer),
            quax(buffer)
         ])
         const urls = response
            .filter(res => res.status === 'fulfilled')
            .map(res => res.value)
         const print = frame('TO URL', urls, '💾')
         m.reply(print)
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}