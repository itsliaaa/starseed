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
         group.antiToxic &&
         !isPartner &&
         !isAdmin &&
         (new RegExp('\\b' + setting.forbiddenWords.join('\\b|\\b') + '\\b')).test(body.toLowerCase())
      ) {
         const participant = group.participants[m.sender]
         handleWarning(m, {
            sock,
            participant,
            note: `5 warnings and you’ll be removed. No more toxicity.`
         })
      }
   },
   group: true,
   botAdmin: true
}