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
      const isPartnerOrOwner = (user) =>
         areJidsSameUser(sock.user.decodedId, user.jid) ||
            user.jid?.startsWith(ownerNumber) ||
               setting.partner.includes(user.jid)
      const sorted = users.sort((a, b) => {
         const aIsPartner = isPartnerOrOwner(a)
         const bIsPartner = isPartnerOrOwner(b)
         if (aIsPartner && !bIsPartner) return -1
         if (!aIsPartner && bIsPartner) return 1
         const aLimit = a.limit ?? 0
         const bLimit = b.limit ?? 0
         return bLimit - aLimit
      })
      const leaderboard = sorted.slice(0, 10).flatMap((userData, index, array) => {
         const lines = [
            `${medal(index)} *Name*: ${userData.name}`,
            `*Limit*: ${isPartnerOrOwner(userData) ? '`ꝏ Unlimited`' : userData.limit}`
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