import { shuffleArray } from '../../lib/Utilities.js'

export default {
   command: 'couple',
   hidden: 'cp',
   category: 'group',
   async run(m, {
      groupMetadata
   }) {
      const [a, b] = shuffleArray(
         groupMetadata.participants.map(participant => participant.phoneNumber)
      )
      m.reply(`🎲 *Random Best Couple*: @${a.split('@')[0]} 💞 @${b.split('@')[0]}`)
   },
   group: true
}