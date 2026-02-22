import { isMimeAudio, isMimeVideo } from '../../lib/Utilities.js'

export default {
   command: ['toaudio', 'tovn'],
   hidden: 'tomp3',
   category: 'tools',
   async run (m, {
      sock,
      command
   }) {
      try {
         const q = m.quoted?.url ? m.quoted : m
         const mimetype = (q.msg || q).mimetype
         if (!isMimeAudio(mimetype) && !isMimeVideo(mimetype))
            return m.reply('💭 Reply media to make it as audio.')
         m.react('🕒')
         sock.sendMedia(m.chat, await q.download(), '', m, {
            audio: true,
            ptt: command === 'tovn'
         })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}