import { HOUR } from '../../lib/Constants.js'
import { randomInteger, toTime } from '../../lib/Utilities.js'

export default {
   command: 'claim',
   category: 'user info',
   async run (m, {
      user
   }) {
      const cooldown = 3 * HOUR
      if (user.lastClaim && user.lastSeen - user.lastClaim < cooldown) {
         const remaining = cooldown - (user.lastSeen - user.lastClaim)
         return m.reply(`⏰ You can claim again in ${toTime(remaining)}`)
      }
      if (user.limit >= user.maxLimit)
         return m.reply('❌ You can\'t claim right now because you\'ve reached the maximum limit.')
      const remaining = user.maxLimit - user.limit
      const reward = randomInteger(1, remaining)
      user.limit += reward
      user.lastClaim = user.lastSeen
      m.reply(`🎉 You've got +${reward} limit.`)
   }
}