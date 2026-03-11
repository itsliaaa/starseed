import AntiSpam from '../../lib/Components/AntiSpam.js'

import { handleWarning } from './_anti-link.js'

const detectSpam = AntiSpam()

export default {
   async run(m, {
      sock,
      group,
      isPartner,
      isAdmin,
      body
   }) {
      if (
         group.antiSpam &&
         !isPartner &&
         !isAdmin &&
         (
            !m.type.startsWith('react') &&
            !m.type.startsWith('poll')
         ) &&
         (
            detectSpam(m.sender) ||
            body.length > 2048
         )
      ) {
         const participant = group.participants[m.sender]
         handleWarning(m, {
            sock,
            participant,
            note: `3 warnings and you’ll be removed. No more spam.`,
            max: 3
         })
      }
   },
   group: true,
   botAdmin: true
}