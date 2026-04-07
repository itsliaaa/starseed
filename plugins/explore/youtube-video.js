import ytsearch from 'yt-search'

import { nexray } from '../../lib/Request.js'

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
         sock.sendMedia(m.chat, videoData.result.url, firstVideo.title, m, {
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