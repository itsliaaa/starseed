import { SCHEMA } from '../../lib/Constants.js'
import { frame, isURL, isWhatsAppURL } from '../../lib/Utilities.js'

export const handleWarning = async (m, {
   sock,
   participant,
   note,
   max = 5
} = {}) => {
   participant.warningPoint += 1
   if (participant.warningPoint >= max) {
      await sock.sendMessage(m.chat, {
         delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.id,
            participant: m.sender
         }
      })
      const print = frame('WARNING', [
         `👋🏻 Good bye!`,
         `*Warning*: 5 / ${max}`
      ], '⚠️')
      await m.reply(print)
      sock.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
   }
   else {
      await sock.sendMessage(m.chat, {
         delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.id,
            participant: m.sender
         }
      })
      const print = frame('WARNING', [
         note,
         `*Warning*: ${participant.warningPoint} / ${max}`
      ], '⚠️')
      await m.reply(print)
   }
}

export default {
   async run(m, {
      sock,
      group,
      isPartner,
      isAdmin,
      body
   }) {
      if (
         group.antiLink &&
         !isPartner &&
         !isAdmin &&
         isURL(body)
      ) {
         const participant = group.participants[m.sender]
         handleWarning(m, {
            sock,
            participant,
            note: `5 warnings and you’ll be removed. No more send any types of link.`
         })
      }
      if (
         group.antiWALink &&
         !isPartner &&
         !isAdmin &&
         isWhatsAppURL(body)
      ) {
         const participant = group.participants[m.sender]
         handleWarning(m, {
            sock,
            participant,
            note: `5 warnings and you’ll be removed. No more send group and channel link.`
         })
      }
   },
   group: true,
   botAdmin: true
}