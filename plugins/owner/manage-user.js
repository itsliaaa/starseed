import { isLidUser } from '@itsliaaa/baileys'

import { extractNumber } from '../../lib/Serialize.js'
import { frame } from '../../lib/Utilities.js'

export default {
   command: ['+partner', '-partner', '-user', 'ban', 'block', 'unban', 'unblock'],
   category: 'owner',
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
               `${isPrefix + command} <reply user message>`,
               `${isPrefix + command} @0`,
               `${isPrefix + command} ${m.sender.split('@')[0]}`
            ], '👉🏻')
         )
      if (isLidUser(userId))
         return m.reply('❌ LID detected, can\'t manage user data.')
      if (userId.startsWith(ownerNumber))
         return m.reply('❌ Can\'t manage owner data.')
      if (userId === sock.user.decodedId)
         return m.reply('❌ Can\'t manage bot data.')
      const user = db.getUser(userId)
      if (!user)
         return m.reply('❌ User not found.')
      if (command === '+partner') {
         if (setting.partner.includes(userId))
            return m.reply('💭 User already as partner.')
         setting.partner.push(userId)
         m.reply(`✅ Successfully add @${userId.split('@')[0]} as partner.`)
      }
      else if (command === '-partner') {
         if (!setting.partner.includes(userId))
            return m.reply('💭 User is not partner.')
         setting.partner.forEach((data, index) => {
            if (data === userId)
               setting.partner.splice(index, 1)
         })
         m.reply(`✅ Successfully removed @${userId.split('@')[0]} from partner.`)
      }
      else if (command === '-user') {
         db.deleteUser(user.jid)
         m.reply('✅ Successfully remove user from database.')
      }
      else if (command === 'ban') {
         if (user.banned)
            return m.reply('❌ User already banned.')
         user.banned = true
         m.reply('✅ Successfully ban user.')
      }
      else if (command === 'block') {
         await sock.updateBlockStatus(userId, 'block')
         m.reply('✅ Successfully block user.')
      }
      else if (command === 'unban') {
         if (!user.banned)
            return m.reply('❌ User already unbanned.')
         user.banned = false
         m.reply('✅ Successfully unban user.')
      }
      else if (command === 'unblock') {
         await sock.updateBlockStatus(userId, 'unblock')
         m.reply('✅ Successfully unblock user.')
      }
   },
   owner: true
}