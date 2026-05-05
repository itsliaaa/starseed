import { zenzxz } from '../../lib/Request.js'
import { uguu } from '../../lib/Scraper.js'
import { fetchAsBuffer, randomInteger } from '../../lib/Utilities.js'

export default {
   command: 'fakewagroup',
   category: 'maker',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         const q = m.quoted ? m.quoted : m
         const mimetype = q.msg?.mimetype
         const [name = m.pushName, members = `${randomInteger(1, 1024)}`, desc = 'Starseed Community', author = m.pushName, date = '27/05/26 11:11'] = text.split('|')
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} Starseed | 1024 | Starseed Community | @itsliaaa | 27/05/26 11:11`)
         m.react('🕒')
         let profilePicture
         if (mimetype)
            profilePicture = await q.download()
         else
            profilePicture = await sock.profilePicture(m.sender)
         const upload = await uguu(
            await fetchAsBuffer(profilePicture)
         )
         const data = await zenzxz('maker/fakegroupv2', {
            url: upload,
            name,
            members,
            desc,
            author,
            date
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