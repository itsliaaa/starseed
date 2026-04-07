import { isJidNewsletter } from '@itsliaaa/baileys'
import ytsearch from 'yt-search'

import { nexray } from '../../lib/Request.js'
import { fetchAsBuffer, formatNumber, frame, isMimeAudio, isMimeWebP } from '../../lib/Utilities.js'

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
         return m.reply(`❌ Newsletter ID are still empty or invalid, the bot owner need to change it with \`${isPrefix}setchid\` command.`)
      const newsletters = await sock.newsletterSubscribed()
      if (!newsletters.some(newsletter => newsletter.id === setting.newsletterId))
         return m.reply('❌ Newsletter was not found using the newsletter ID you previously configured.')
      if (!isMeNewsletterAdmin(setting.newsletterId, newsletters))
         return m.reply('❌ Bot is neither the admin nor the owner of the newsletter ID you previously configured.')
      if (command === 'playch') {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} you say run`)
         m.react('🕒')
         const data = await ytsearch(text)
         if (!data.all?.length)
            return m.reply('❌ Failed to get data.')
         const firstVideo = data.all[0]
         const audioData = await nexray('downloader/ytmp3', {
            url: firstVideo.url
         })
         if (!audioData.status)
            return m.reply('❌ Failed to get data.')
         const printCaption = frame('YOUTUBE PLAY', [
            `*Title*: ${firstVideo.title}`,
            `*Views*: ${formatNumber(firstVideo.views || 0)}`,
            `*Duration*: ${firstVideo.timestamp || '0:00'}`,
            `*Uploaded*: ${firstVideo.ago || 'Long time ago'}`
         ], '🎵')
         sock.sendText(setting.newsletterId, printCaption, null, {
            externalAdReply: {
               title: firstVideo.title,
               body: firstVideo.description,
               thumbnail: await fetchAsBuffer(firstVideo.image || botThumbnail),
               url: firstVideo.url,
               sourceUrl: firstVideo.url,
               largeThumbnail: true,
               mediaType: 2
            }
         })
         const context = await sock.sendMedia(setting.newsletterId, audioData.result.url, '', null, {
            ptt: true
         })
         sock.sendText(m.chat, '✅ Successfully sent music to newsletter.', context)
      }
      else if (command === 'playvidch' || command === 'ptvch') {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} mayonaka`)
         m.react('🕒')
         const data = await ytsearch(text)
         if (!data.all?.length)
            return m.reply('❌ Failed to get data.')
         const firstVideo = data.all[0]
         if (firstVideo.seconds > 1440)
            return m.reply('❌ Video is too long. Maximum duration is 24 minutes.')
         const videoData = await nexray('downloader/v1/ytmp4', {
            url: firstVideo.url
         })
         if (!videoData.status)
            return m.reply('❌ Failed to get data.')
         const context = await sock.sendMedia(setting.newsletterId, videoData.result.url, firstVideo.title, null, {
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