import { handleWarning } from './_anti-link.js'

export default {
   async run(m, {
      sock,
      group,
      isPartner,
      isAdmin,
   }) {
      if (
         group.antiGroupStatus &&
         !isPartner &&
         !isAdmin &&
         (
            m.message.groupStatusMessage ||
            m.message.groupStatusMessageV2
         )
      ) {
         const participant = group.participants[m.sender]
         handleWarning(m, {
            sock,
            participant,
            note: `3 warnings and you’ll be removed. No more group status posts.`,
            max: 3
         })
      }
   },
   group: true,
   botAdmin: true
}