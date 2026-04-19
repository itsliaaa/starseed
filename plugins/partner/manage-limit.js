import { isLidUser } from '@itsliaaa/baileys'

import { extractNumber } from '../../lib/Serialize.js'
import { frame } from '../../lib/Utilities.js'

export default {
   command: ['+limit', '-limit'],
   category: 'partner',
   async run (m, {
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
               `${isPrefix + command} 15 <reply user message>`,
               `${isPrefix + command} @0 15`,
               `${isPrefix + command} ${m.sender.split('@')[0]} 15`
            ], '👉🏻')
         )
      if (isLidUser(userId))
         return m.reply('❌ LID detected, can\'t add user limit.')
      if (userId.startsWith(ownerNumber))
         return m.reply('❌ Can\'t manage owner limit.')
      if (userId === sock.user.decodedId)
         return m.reply('❌ Can\'t manage bot limit.')
      if (setting.partner.includes(userId))
         return m.reply('❌ Can\'t manage partner limit.')
      const user = db.getUser(userId)
      if (!user)
         return m.reply('❌ User not found.')
      const quantity = parseInt(
         m.args.find(arg => {
            const number = Number(arg)
            return Number.isInteger(number) && arg.length <= 4
         })
      )
      if (command === '+limit') {
         user.limit += quantity
         m.reply(`✅ Successfully add ${quantity} limit to @${userId.split('@')[0]}.`)
      }
      else if (command === '-limit') {
         user.limit -= quantity
         m.reply(`✅ Successfully remove ${quantity} limit from @${userId.split('@')[0]}.`)
      }
   },
   partner: true
}