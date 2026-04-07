import { isJidNewsletter } from '@itsliaaa/baileys'

import { zenzxz } from '../../lib/Request.js'

export default {
   command: ['tiktok', 'tikwm', 'ttmp3', 'ttvn'],
   hidden: ['tt', 'ttmp4', 'ttwm'],
   category: 'download',
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
         const data = await zenzxz('download/tiktok', {
            url: args[0]
         })
         if (!data.status)
            return m.reply('❌ Failed to get data.')
         const isNeedAudio = command === 'ttmp3' || command === 'ttvn'
         const isNeedWM = command === 'tikwm' || command === 'ttwm'
         const videoContent = data.result.hdplay || data.result.play
         const videoWMContent = data.result.wmplay
         const imageContent = data.result.images
         if (imageContent?.length > 1 && !isNeedAudio)
            return sock.sendMessage(m.chat, {
               album: imageContent.map(imageUrl => ({
                  image: {
                     url: imageUrl
                  }
               }))
            }, {
               quoted: m
            })
         const url = isNeedAudio ?
            data.result.music :
            isNeedWM ?
               videoWMContent :
               imageContent?.[0] ||
                  videoContent
         sock.sendMedia(m.chat, url, data.result.title, m, {
            audio: command === 'ttmp3',
            ptt: command === 'ttvn' || isJidNewsletter(m.chat)
         })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}