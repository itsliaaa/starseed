import { isJidNewsletter } from '@itsliaaa/baileys'
import ytsearch from 'yt-search'

import { nexray } from '../../lib/Request.js'
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
         m.reply(printCaption, {
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
         sock.sendMedia(m.chat, audioData.result.url, '', m, {
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