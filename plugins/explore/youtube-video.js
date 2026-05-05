import { ytdl, yts } from '../../lib/Scraper.js'

export default {
   command: ['playvideo', 'ptv'],
   category: 'explore',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} mayonaka`)
         m.react('🕒')
         const data = await yts(text)
         const firstVideo = data.all[0]
         if (firstVideo.seconds > 1440)
            return m.reply('❌ Video is too long. Maximum duration is 24 minutes.')
         const videoUrl = await ytdl(firstVideo.url, {
            type: 'video',
            format: 'mp4',
            quality: '720p'
         })
         sock.sendMedia(m.chat, videoUrl, firstVideo.title, m, {
            ptv: command === 'ptv'
         })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}