import { HOUR, MINUTE } from '../../lib/Constants.js'
import { randomInteger, toTime } from '../../lib/Utilities.js'

const CHARGE_AMOUNT = 15
const COOLDOWN = MINUTE * 5

export default {
   command: 'chargeenergy',
   hidden: 'charge',
   category: 'user info',
   async run (m, {
      user
   }) {
      if (user.energy >= 100)
         return m.reply('❌ You can\'t charge energy right now because you\'ve reached the maximum energy limit.')
      if (user.lastCharge && user.lastSeen - user.lastCharge < COOLDOWN) {
         const remaining = COOLDOWN - (user.lastSeen - user.lastCharge)
         return m.reply(`⏰ You can charge energy again in ${toTime(remaining)}`)
      }
      const chargedEnergy = Math.min(user.energy + CHARGE_AMOUNT, 100)
      const restored = chargedEnergy - user.energy
      user.energy = chargedEnergy
      user.lastCharge = user.lastSeen
      m.reply(`✨ ${restored} energy restored. And 3 of your limits has been consumed.`)
   },
   limit: 3
}