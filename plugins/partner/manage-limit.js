export default {
   command: ['+limit', '-limit'],
   category: 'partner',
   async run (m, {
      db,
      command,
      args
   }) {
      let userId = m.quoted?.sender
      if (!userId)
         return m.reply('💭 Reply user message.')
      if (m.quoted?.isMe ||
         userId === m.sender ||
         userId.startsWith(ownerNumber))
         return m.reply('❌ Invalid user.')
      const user = db.getUser(userId)
      if (!user)
         return m.reply('❌ User not found.')
      if (command === '+limit') {
         const [quantity] = args
         if (isNaN(quantity))
            return m.reply('❌ Input must be a number')
         user.limit += Number(quantity)
         m.reply(`✅ Successfully add ${quantity} limit to @${userId.split('@')[0]}.`)
      }
      else if (command === '-limit') {
         const [quantity] = args
         if (isNaN(quantity))
            return m.reply('❌ Input must be a number')
         user.limit -= Number(quantity)
         m.reply(`✅ Successfully remove ${quantity} limit from @${userId.split('@')[0]}.`)
      }
   },
   partner: true
}