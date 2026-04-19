import { isLidUser } from '@itsliaaa/baileys'

import { DAY } from '../../lib/Constants.js'
import { extractNumber } from '../../lib/Serialize.js'
import { formatTime, frame } from '../../lib/Utilities.js'

const EXTRA_LIMIT = 20
const EXTRA_ENERGY = 35

export default {
   command: ['+premium', '-premium'],
   hidden: ['+prem', '-prem'],
   category: 'partner',
   async run(m, {
      sock,
      db,
      setting,
      isPrefix,
      command
   }) {
      const userId = extractNumber(m)
      if (!userId)
         return m.reply(
            frame('EXAMPLE', [
               `${isPrefix + command} 7 <reply user message>`,
               `${isPrefix + command} @0 7`,
               `${isPrefix + command} ${m.sender.split('@')[0]} 7`
            ], '👉🏻')
         )
      if (isLidUser(userId))
         return m.reply('❌ LID detected, can\'t add premium access.')
      if (userId.startsWith(ownerNumber))
         return m.reply('❌ Can\'t manage owner premium access.')
      if (userId === sock.user.decodedId)
         return m.reply('❌ Can\'t manage bot premium access.')
      if (setting.partner.includes(userId))
         return m.reply('❌ Can\'t manage partner premium access.')
      const userData = db.getUser(userId)
      if (!userData?.jid)
         return m.reply('❌ User not found.')
      if (command === '+premium' || command === '+prem') {
         const days = parseInt(
            m.args.find(arg => {
               const num = Number(arg)
               return Number.isInteger(num) && arg.length <= 4
            })
         )
         if (!days)
            return m.reply('💭 Please specify the duration in days.')
         const isPremium = userData.premiumExpiry > 0
         const expiry = DAY * days
         userData.limit += EXTRA_LIMIT * days
         userData.energy += EXTRA_ENERGY * days
         userData.premiumExpiry = isPremium ?
            userData.premiumExpiry + expiry :
            Date.now() + expiry
         userData._notifiedPremium = false
         m.reply(`✅ Successfully add premium access for @${userData.jid.split('@')[0]} and will expired at ${formatTime(undefined, userData.premiumExpiry)}.`)
      }
      else if (command === '-premium' || command === '-prem') {
         userData.limit = defaultLimit
         userData.energy = 100
         userData.premiumExpiry = 0
         userData._notifiedPremium = false
         m.reply(`✅ Successfully removed premium access for @${userData.jid.split('@')[0]}.`)
      }
   },
   partner: true
}