import { HOUR } from '../../lib/Constants.js'
import { randomInteger, toTime } from '../../lib/Utilities.js'

const COOLDOWN = HOUR * 2

export default {
   command: 'claim',
   category: 'user info',
   async run (m, {
      user
   }) {
      if (user.lastClaim && user.lastSeen - user.lastClaim < COOLDOWN) {
         const remaining = COOLDOWN - (user.lastSeen - user.lastClaim)
         return m.reply(`⏰ You can claim again in ${toTime(remaining)}`)
      }
      if (user.limit >= defaultLimit)
         return m.reply('❌ You can\'t claim right now because you\'ve reached the maximum limit.')
      const remaining = defaultLimit - user.limit
      const reward = randomInteger(1, remaining)
      user.limit += reward
      user.lastClaim = user.lastSeen
      m.reply(`🎉 You've got +${reward} limit.`)
   }
}