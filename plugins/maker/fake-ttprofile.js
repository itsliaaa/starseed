import { zenzxz } from '../../lib/Request.js'
import { uguu } from '../../lib/Scraper.js'
import { fetchAsBuffer, randomInteger } from '../../lib/Utilities.js'

export default {
   command: 'fakettprofile',
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
         const [name = m.pushName, username = m.pushName, following = `${randomInteger(1, 1000)}`, followers = `${randomInteger(1, 1000)}`, likes = `${randomInteger(1, 100000)}`] = text.split('|')
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} Lia Wynn | @itsliaaa | 10 | 100 | 1000 | 100000`)
         m.react('🕒')
         let profilePicture
         if (mimetype)
            profilePicture = await q.download()
         else
            profilePicture = await sock.profilePicture(m.sender)
         const upload = await uguu(
            await fetchAsBuffer(profilePicture)
         )
         const data = await zenzxz('maker/faketiktok', {
            name,
            username,
            following,
            followers,
            likes,
            url: upload
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