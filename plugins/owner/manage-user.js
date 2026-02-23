import { isLidUser } from '@itsliaaa/baileys'

export default {
   command: ['+partner', '-partner', '-user', 'ban', 'block', 'unban', 'unblock'],
   category: 'owner',
   async run (m, {
      db,
      sock,
      setting,
      partner,
      command
   }) {
      let userId = m.quoted?.sender || m.mentionedJid[0]
      if (!userId)
         return m.reply('💭 Reply user message.')
      if (
         m.quoted?.isMe ||
         userId === m.sender ||
         userId.startsWith(ownerNumber) ||
         isLidUser(userId)
      )
         return m.reply('❌ Invalid user.')
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
         db.database.users.delete(user.jid)
         m.reply('✅ Successfully remove user from database.')
      }
      else if (command === 'ban') {
         if (user.banned)
            m.reply('❌ User already banned.')
         user.banned = true
         m.reply('✅ Successfully ban user.')
      }
      else if (command === 'block') {
         await sock.updateBlockStatus(userId, 'block')
         m.reply('✅ Successfully block user.')
      }
      else if (command === 'unban') {
         if (!user.banned)
            m.reply('❌ User already unbanned.')
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