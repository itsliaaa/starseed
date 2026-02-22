import { isJidNewsletter } from '@itsliaaa/baileys'

import { isMimeImage } from '../../lib/Utilities.js'

export const isMeNewsletterAdmin = (id, data) =>
   data.find(newsletter => newsletter.id === id)
      .viewer_metadata
      .role !== 'SUBSCRIBER'

export default {
   command: ['setchname', 'setchdesc', 'setchpp'],
   category: 'owner',
   async run (m, {
      sock,
      setting,
      isPrefix,
      command,
      text
   }) {
      if (!setting.newsletterId || !isJidNewsletter(setting.newsletterId))
         return m.reply('❌ Newsletter ID are still empty or invalid.')
      const newsletters = await sock.newsletterSubscribed()
      if (!newsletters.some(newsletter => newsletter.id === setting.newsletterId))
         return m.reply('❌ Newsletter was not found using the newsletter ID you previously configured.')
      if (!isMeNewsletterAdmin(setting.newsletterId, newsletters))
         return m.reply('❌ Bot is neither the admin nor the owner of the newsletter ID you previously configured.')
      if (command === 'setchname') {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} Starseed`)
         if (text.length > 100)
            return m.reply('❌ Max characters for newsletter name is 100.')
         await sock.newsletterUpdateName(setting.newsletterId, text)
         m.reply('✅ Successfully change the newsletter name.')
      }
      else if (command === 'setchdesc') {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} Weekly fresh updates`)
         if (text.length > 1000)
            return m.reply('❌ Max characters for newsletter description is 1000.')
         await sock.newsletterUpdateDescription(setting.newsletterId, text)
         m.reply('✅ Successfully change the newsletter description.')
      }
      else if (command === 'setchpp') {
         const q = m.quoted?.url ? m.quoted : m
         const mimetype = (q.msg || q).mimetype
         if (!isMimeImage(mimetype))
            return m.reply('💭 Provide an image to change newsletter picture.')
         await sock.newsletterUpdatePicture(setting.newsletterId, await q.download())
         m.reply('✅ Successfully changed.')
      }
   },
   owner: true
}