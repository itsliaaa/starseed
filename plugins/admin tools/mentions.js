import { isMimeAudio, isMimeWebP, frame } from '../../lib/Utilities.js'

export default {
   command: ['everyone', 'hidetag', 'tagall', 'totag'],
   category: 'admin tools',
   async run(m, {
      sock,
      command,
      text,
      groupMetadata
   }) {
      const q = m.quoted ? m.quoted : m
      const body = text || q.body
      const mimetype = q.msg?.mimetype
      const media = mimetype ? await q.download() : null
      const options = {
         mentionAll: true
      }
      let printBody = body
      if (command === 'everyone') {
         printBody = `@${m.chat} ` + body
         options.contextInfo = {
            groupMentions: [{
               groupJid: m.chat,
               groupSubject: 'everyone'
            }]
         }
      }
      if (command === 'tagall') {
         const lines = body || `An admin mentioned everyone in the group.`
         printBody = frame('TAG ALL', lines.split(/\r?\n/), '📌')
         printBody += '\n\n'
         printBody += frame('PARTICIPANTS', groupMetadata.participants.map(participant =>
            `@${participant.phoneNumber.split('@')[0]}`
         ), '👤')
         options.mentionAll = false
      }
      if (mimetype) {
         options.audio = isMimeAudio(mimetype)
         options.ptt = q.ptt
         options.sticker = isMimeWebP(mimetype)
         sock.sendMedia(m.chat, media, printBody, null, options)
      }
      else
         sock.sendText(m.chat, printBody, null, options)
   },
   group: true,
   admin: true
}