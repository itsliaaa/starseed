import { SCHEMA } from '../../lib/Constants.js'

import { handleWarning } from './_anti-link.js'

export default {
   async run(m, {
      sock,
      group,
      setting,
      isPartner,
      isAdmin,
      body
   }) {
      if (
         group.antiTagStatus &&
         !isPartner &&
         !isAdmin &&
         m.message.groupStatusMentionMessage
      ) {
         const participant = group.participants[m.sender]
         handleWarning(m, {
            sock,
            participant,
            note: `3 warnings and you’ll be removed. No more status mention.`,
            max: 3
         })
      }
   },
   group: true,
   botAdmin: true
}