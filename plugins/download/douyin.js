import { isJidNewsletter } from '@itsliaaa/baileys'

import { nexray } from '../../lib/Request.js'

export default {
   command: ['douyin', 'doump3', 'douvn'],
   category: 'download',
   async run(m, {
      sock,
      isPrefix,
      command,
      args
   }) {
      try {
         if (!args[0])
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} https://v.douyin.com/if894Bb/`)
         if (!args[0].includes('douyin.com'))
            return m.reply('❌ Invalid URL.')
         m.react('🕒')
         const data = await nexray('downloader/douyin', {
            url: args[0]
         })
         if (!data.status)
            return m.reply('❌ Failed to get data.')
         const isNeedAudio = command === 'doump3' || command === 'douvn'
         const videoContent = data.result.media.find(media => media.type === 'video')
         const imageContent = data.result.media.filter(media => media.type === 'image')
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
         sock.sendMedia(m.chat, videoContent.url, data.result.title, m, {
            audio: command === 'doump3',
            ptt: command === 'douvn' || isJidNewsletter(m.chat)
         })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}