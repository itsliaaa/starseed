import { zenzxz } from '../../lib/Request.js'
import { uguu } from '../../lib/Scraper.js'
import { fetchAsBuffer, randomInteger } from '../../lib/Utilities.js'

export default {
   command: 'fakewachannel',
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
         const [name = m.pushName, followers = `${randomInteger(100, 10000)}`, desc = 'Weekly fresh updates', date = '27/05/26'] = text.split('|')
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} Starseed | 1000 | Weekly fresh updates | 27/05/26`)
         m.react('🕒')
         let profilePicture
         if (mimetype)
            profilePicture = await q.download()
         else
            profilePicture = await sock.profilePicture(m.sender)
         const upload = await uguu(
            await fetchAsBuffer(profilePicture)
         )
         const data = await zenzxz('maker/fakechannel', {
            url: upload,
            name,
            followers,
            desc,
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