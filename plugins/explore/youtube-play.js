import { isJidNewsletter } from '@itsliaaa/baileys'

import { ytdl, yts } from '../../lib/Scraper.js'
import { fetchAsBuffer, frame, formatNumber } from '../../lib/Utilities.js'

export default {
   command: 'play',
   category: 'explore',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} you say run`)
         m.react('🕒')
         const data = await yts(text)
         const firstVideo = data.all[0]
         const audioUrl = await ytdl(firstVideo.url)
         const printCaption = frame('YOUTUBE PLAY', [
            `*Title*: ${firstVideo.title}`,
            `*Views*: ${formatNumber(firstVideo.views || 0)}`,
            `*Duration*: ${firstVideo.timestamp || '0:00'}`,
            `*Uploaded*: ${firstVideo.ago || 'Long time ago'}`
         ], '🎵')
         m.reply(printCaption, {
            title: firstVideo.title,
            description: firstVideo.description,
            thumbnail: await fetchAsBuffer(firstVideo.image || botThumbnail),
            thumbnailUrl: firstVideo.url,
            largeThumbnail: true,
            previewType: 1
         })
         sock.sendMedia(m.chat, audioUrl, '', m, {
            audio: true,
            ptt: isJidNewsletter(m.chat)
         })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}