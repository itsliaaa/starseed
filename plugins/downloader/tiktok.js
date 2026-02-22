import { tiktok } from '../../lib/Scraper.js'

export default {
   command: ['tiktok', 'ttmp3', 'ttvn'],
   hidden: 'tt',
   category: 'downloader',
   async run(m, {
      sock,
      isPrefix,
      command,
      args
   }) {
      try {
         if (!args[0])
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} https://vt.tiktok.com/ZSUYJLQfg/`)
         if (!args[0].includes('tiktok.com'))
            return m.reply('❌ Invalid URL.')
         m.react('🕒')
         const data = await tiktok(args[0])
         if (!data.media.length)
            return m.reply('❌ Failed to get data.')
         const isNeedAudio = command === 'ttmp3' || command === 'ttvn'
         const videoContent = data.media.find(video => video.type === 'hd' || video.type === 'mp4')
         const imageContent = data.media.filter(image => image.type === 'image')
         if (imageContent.length > 1 && !isNeedAudio)
            return sock.sendMessage(m.chat, {
               album: imageContent.map(image => ({
                  image: {
                     url: image.url
                  }
               }))
            }, {
               quoted: m
            })
         const url = isNeedAudio ?
            data.audio :
            imageContent[0]?.url ||
               videoContent?.url
         sock.sendMedia(m.chat, url, data.title, m, {
            audio: command === 'ttmp3',
            ptt: command === 'ttvn'
         })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}