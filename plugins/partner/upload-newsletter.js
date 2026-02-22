import { isJidNewsletter } from '@itsliaaa/baileys'

import { nexray } from '../../lib/Request.js'
import { isMimeAudio, isMimeWebP } from '../../lib/Utilities.js'

import { isMeNewsletterAdmin } from '../owner/manage-newsletter.js'

export default {
   command: ['playch', 'playvidch', 'ptvch', 'upch'],
   category: 'partner',
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
      if (command === 'playch') {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} you say run`)
         m.react('🕒')
         const data = await nexray('downloader/ytplay', {
            q: text
         })
         if (!data.status)
            return m.reply('❌ Failed to get data.')
         const context = await sock.sendMedia(setting.newsletterId, data.result.download_url, '', m, {
            ptt: true
         })
         sock.sendText(m.chat, '✅ Successfully sent music to newsletter.', context)
      }
      else if (command === 'playvidch' || command === 'ptvch') {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} mayonaka`)
         m.react('🕒')
         const data = await nexray('downloader/ytplayvid', {
            q: text
         })
         if (!data.status)
            return m.reply('❌ Failed to get data.')
         const context = await sock.sendMedia(setting.newsletterId, data.result.download_url, data.result.title, m, {
            ptv: command === 'ptvch'
         })
         sock.sendText(m.chat, '✅ Successfully sent video to newsletter.', context)
      }
      else if (command === 'upch') {
         const q = m.quoted ? m.quoted : m
         const body = text ?? q.body
         const mimetype = (q.msg || q).mimetype
         if (!body && !mimetype)
            return m.reply('💭 Provide text or media you would like to send to the newsletter.')
         m.react('🕒')
         let context
         if (mimetype)
            context = await sock.sendMedia(setting.newsletterId, await q.download(), body, null, {
               sticker: isMimeWebP(mimetype),
               ptt: isMimeAudio(mimetype),
               ptv: q.type.startsWith('ptv')
            })
         else if (body)
            context = await sock.sendText(setting.newsletterId, body)
         sock.sendText(m.chat, '✅ Successfully sent message to newsletter.', context)
      }
   },
   partner: true
}