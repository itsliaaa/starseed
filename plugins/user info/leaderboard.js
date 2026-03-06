import { areJidsSameUser } from '@itsliaaa/baileys'

import { frame, medal } from '../../lib/Utilities.js'

export default {
   command: ['limit', 'leaderboard'],
   category: 'user info',
   async run(m, {
      sock,
      db,
      user: senderData,
      setting,
      command
   }) {
      const users = [...new Set(db.users.values())]
      const isPartnerOrOwner = user =>
         setting.partner.includes(user.jid) ||
         user.jid?.startsWith(ownerNumber) ||
         areJidsSameUser(sock.user.decodedId, user.jid)
      const sorted = users.sort((a, b) => {
         const aIsPartner = isPartnerOrOwner(a)
         const bIsPartner = isPartnerOrOwner(b)
         if (aIsPartner && !bIsPartner) return -1
         if (!aIsPartner && bIsPartner) return 1
         const aLimit = a.limit ?? 0
         const bLimit = b.limit ?? 0
         return bLimit - aLimit
      })
      const leaderboard = sorted.slice(0, 10).flatMap((user, index, array) => {
         const lines = [
            `${medal(index)} *Name*: ${user.name}`,
            `*Limit*: ${isPartnerOrOwner(user) ? '`ꝏ Unlimited`' : user.limit}`
         ]
         if (index !== array.length - 1)
            lines.push('')
         return lines
      })
      const printMyLeaderboard = frame('LIMIT', [
         `*Name*: ${senderData.name}`,
         `*Limit*: ${isPartnerOrOwner(senderData) ? '`ꝏ Unlimited`' : senderData.limit}`,
         `*Ranked At*: ${users.findIndex(user => user.jid === senderData.jid) + 1} of ${users.length} users`
      ], '👤')
      if (command === 'limit')
         return m.reply(printMyLeaderboard)
      const printLeaderboard = frame('LEADERBOARD', leaderboard, '📊')
      m.reply(printMyLeaderboard + '\n\n' +
         printLeaderboard)
   }
}