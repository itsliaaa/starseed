import { handleWarning } from './_anti-link.js'

export default {
   async run(m, {
      sock,
      group,
      groupMetadata,
      isPartner,
      isAdmin
   }) {
      if (
         group.antiTagAll &&
         !isPartner &&
         !isAdmin &&
         (
            m.mentionedJid.length >= groupMetadata.size ||
            m.msg?.contextInfo?.nonJidMentions ||
            m.mentionedJid.length > 10
         )
      ) {
         const participant = group.participants[m.sender]
         handleWarning(m, {
            sock,
            participant,
            note: `3 warnings and you’ll be removed. Please don’t tag all group participants again.`,
            max: 3
         })
      }
   },
   group: true,
   botAdmin: true
}