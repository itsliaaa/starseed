import { handleWarning } from './_anti-link.js'

const BOT_PREFIXES_REGEX = /(starfall|neoxr|laurine|ftg|uzumi|kagez|sh3nn|michelle|violetics)/i

const InteractiveTypes = new Set(['interactiveMessage', 'buttonsMessage', 'templateMessage', 'listMessage'])

export default {
   async run(m, {
      sock,
      group,
      isPartner,
      isAdmin
   }) {
      if (
         group.antiBot &&
         !isPartner &&
         !isAdmin &&
         (
            BOT_PREFIXES_REGEX.test(m.id) ||
            InteractiveTypes.has(m.type)
         )
      ) {
         const participant = group.participants[m.sender]
         handleWarning(m, {
            sock,
            participant,
            note: `3 warnings and you’ll be removed. Please don’t make your number as bot again.`,
            max: 3
         })
      }
   },
   group: true,
   botAdmin: true
}