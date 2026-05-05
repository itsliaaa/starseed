import { catbox, litterbox, puticu, uguu, quax } from '../../lib/Scraper.js'

const hasExpiry = ['litter.', 'put.', 'uguu.']

export default {
   command: 'tourl',
   category: 'tools',
   async run (m, {
      sock,
      command
   }) {
      try {
         const q = m.quoted ? m.quoted : m
         const mimetype = q.msg?.mimetype
         if (!mimetype)
            return m.reply('💭 Reply media to upload.')
         m.react('🕒')
         const buffer = await q.download()
         const response = await Promise.allSettled([
            catbox(buffer),
            litterbox(buffer),
            puticu(buffer),
            uguu(buffer),
            quax(buffer)
         ])
         const urls = response
            .filter(res => res.status === 'fulfilled')
            .map((res, index) => {
               const url = res.value
               const isHasExpiry = hasExpiry.some(endpoint => url.includes(endpoint))
               const expiryInfo = isHasExpiry ? '(Temporary)' : ''
               return ({
                  text: `${index + 1}. ${url}`,
                  title: `📤 ${expiryInfo} Media Uploaded`,
                  url
               })
            })
         if (!urls.length)
            return m.reply('❌ Failed to upload to all services.')
         sock.sendMessage(m.chat, {
            headerText: '# 💾 TO URL',
            contentText: '---',
            links: urls
         }, {
            quoted: m
         })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}