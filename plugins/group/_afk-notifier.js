import { delay } from '@itsliaaa/baileys'

import { frame, isEmptyObject, toTime } from '../../lib/Utilities.js'

export default {
   async run(m, {
      sock,
      db,
      user: senderData,
      setting,
      groupMetadata,
   }) {
      if (m.fromMe) return
      let mentions = m.mentionedJid
      if (m.quoted)
         mentions = [...m.mentionedJid, m.quoted.sender]
      if (!mentions.length) return
      for (const userId of mentions) {
         const userData = db.getUser(userId)
         if (
            !userData ||
            isEmptyObject(userData.afkContext)
         ) continue
         const printNotifySender = frame('AFK', [
            `💭 @${userId.split('@')[0]} is not available right now.`,
            `🏷️ *Reason*: ${userData.afkReason || '-'}`,
            `🕒 *During*: ${toTime(senderData.lastSeen - userData.afkTimestamp)}`
         ], '⚠️')
         const printNotifyAFK = frame('HELLO', [
            `💬 Someone from ${groupMetadata.subject}'s group, tagged or mentioned you.`,
            `👤 *Sender*: @${m.sender.split('@')[0]}`
         ], '👋🏻')
         sock.sendText(m.chat, printNotifySender, m)
         if (!setting.afkNotifier) continue
         await delay(3000)
         sock.sendText(userId, printNotifyAFK, m)
      }
   },
   group: true
}