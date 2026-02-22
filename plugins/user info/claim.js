import { HOUR } from '../../lib/Constants.js'
import { randomInteger, toTime } from '../../lib/Utilities.js'

export default {
   command: 'claim',
   category: 'user info',
   async run (m, {
      user
   }) {
      const now = Date.now()
      const cooldown = 5 * HOUR
      if (user.lastClaim && now - user.lastClaim < cooldown) {
         const remaining = cooldown - (now - user.lastClaim)
         return m.reply(`⏰ You can claim again in ${toTime(remaining)}`)
      }
      const reward = randomInteger(1, defaultLimit)
      user.limit += reward
      user.lastClaim = now
      m.reply(`🎉 You've got ${reward} limit.`)
   }
}