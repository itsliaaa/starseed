import { OWNER_VCARD } from '../../lib/Constants.js'

export default {
   command: 'owner',
   category: 'other',
   async run (m, {
      sock,
      user,
      text
   }) {
      const contact = await sock.sendMessage(m.chat, {
         contacts: {
            displayName: ownerName,
            contacts: [{
               vcard: OWNER_VCARD
            }]
         }
      }, {
         quoted: m
      })
      sock.sendText(m.chat, '💭 Please contact the owner if you have any questions.', contact)
   }
}