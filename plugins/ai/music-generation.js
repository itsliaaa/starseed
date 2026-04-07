import { isJidNewsletter } from '@itsliaaa/baileys'

import { zenzxz } from '../../lib/Request.js'
import { fetchAsBuffer } from '../../lib/Utilities.js'

export default {
   command: 'suno',
   category: 'ai',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         const [lyrics = '', title = '', tags = 'Acoustic', instrumental = 'no'] = text.split('|')
         if (!text || !title || !lyrics)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} [Verse]\nI watch you from a quiet place\nEvery smile I try to trace\n\n[Chorus]\nBrother, you’re my only light\nToo close, but never in sight | Close to You | Acoustic`)
         m.react('🕒')
         const data = await zenzxz('ai/songgenlyrics', undefined, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               title,
               lyrics,
               tags,
               instrumental: instrumental === 'yes'
            })
         })
         if (!data.status)
            return m.reply('❌ Failed to get data.')
         for (const result of data.result)
            await sock.sendMedia(m.chat, result.audio_url, '', m, {
               audio: true,
               ptt: isJidNewsletter(m.chat),
               mimetype: 'audio/mpeg',
               fileName: title + '.mp3',
               externalAdReply: {
                  title,
                  body: '🎵 A song created by ' + m.pushName,
                  thumbnail: await fetchAsBuffer(result.image_url || botThumbnail),
                  largeThumbnail: true
               }
            })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}