import { isMimeAudio, randomHex } from '../../lib/Utilities.js'

export default {
   command: 'upsw',
   category: 'owner',
   async run(m, {
      sock,
      store,
      text
   }) {
      const q = m.quoted ? m.quoted : m
      const body = text ?? q.body
      const mimetype = (q.msg || q).mimetype
      if (!body && !mimetype)
         return m.reply('💭 Provide text or media you would like to send to the status.')
      m.react('🕒')
      const content = {}
      const options = {}
      if (mimetype) {
         const bufferMedia = await q.download()
         if (!Buffer.isBuffer(bufferMedia))
            return m.reply('❌ Failed to download media.')
         content[mimetype.split('/')[0]] = bufferMedia
         content.caption = body
         content.ptt = isMimeAudio(mimetype)
      }
      else {
         content.text = body
         options.backgroundColor = randomHex()
      }
      const ids = Array.from(store.groupMetadata.keys())
      const context = await sock.sendMessage(ids, content, options)
      sock.sendText(m.chat, `✅ Successfully sent status to ${ids.length} groups.`, context)
   },
   owner: true
}