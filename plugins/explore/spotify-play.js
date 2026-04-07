import { isJidNewsletter } from '@itsliaaa/baileys'

import { zenzxz } from '../../lib/Request.js'
import { fetchAsBuffer, frame, toTime } from '../../lib/Utilities.js'

export default {
   command: 'spotplay',
   category: 'explore',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} abnormal heat`)
         m.react('🕒')
         const data = await zenzxz('search/spotify', {
            q: text
         })
         if (!data.status || !data.result?.success)
            return m.reply('❌ Failed to get data.')
         const firstAudio = data.result.results[0]
         const trackUrl = 'https://open.spotify.com/track/' + firstAudio.id
         const audioData = await zenzxz('download/spotify', {
            url: trackUrl
         })
         if (!audioData.status)
            return m.reply('❌ Failed to get data.')
         const printMessage = frame('SPOTIFY', [
            `*Title*: ${audioData.result.title}`,
            `*Artist*: ${audioData.result.artist}`,
            `*Duration*: ${toTime(audioData.result.duration_ms)}`
         ], '🎵')
         m.reply(printMessage, {
            externalAdReply: {
               title: audioData.result.title,
               body: '✍🏻 Artist: ' + audioData.result.artist,
               thumbnail: await fetchAsBuffer(audioData.result.thumbnail || botThumbnail),
               url: trackUrl,
               sourceUrl: trackUrl,
               largeThumbnail: true
            }
         })
         sock.sendMedia(m.chat, audioData.result.download_url, '', m, {
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