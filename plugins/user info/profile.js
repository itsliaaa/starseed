import { areJidsSameUser } from '@itsliaaa/baileys'

import { extractNumber } from '../../lib/Serialize.js'
import { fetchAsBuffer, frame, greeting } from '../../lib/Utilities.js'

export default {
   command: 'profile',
   hidden: 'me',
   category: 'user info',
   async run (m, {
      sock,
      db,
      setting
   }) {
      const userId = extractNumber(m) || m.sender
      const userData = db.getUser(userId)
      if (!userData)
         return m.reply('❌ User not found.')
      const isPartnerOrOwner = (user) =>
         areJidsSameUser(sock.user.decodedId, user.jid) ||
            user.jid?.startsWith(ownerNumber) ||
               setting.partner.includes(user.jid)
      let warningPoint
      if (m.isGroup)
         warningPoint = db.getGroup(m.chat).participants[userId]?.warningPoint
      const isPartner = isPartnerOrOwner(userData)
      const profilePicture = await sock.profilePicture(userData.jid)
      const printUserInfo = frame('USER INFO', [
         `*Name*: ${userData.name}`,
         `*Limit*: ${isPartner ? '`ꝏ Unlimited`' : userData.limit}`,
         `*Energy*: ${isPartner ? '`ꝏ Unlimited`' : userData.energy}`,
      ], '👤')
      const printUserStats = frame('USER STATS', [
         `*Hit Command*: ${userData.commandUsage}x`,
         `*Warning*: ${warningPoint ?? '-'} point`,
         `*Partner*: ${isPartner ? '✅' : '❌'}`,
         `*Premium*: ${userData.premiumExpiry > 0 ? '✅' : '❌'}`,
         `*Banned*: ${userData.banned ? '✅' : '❌'}`
      ], '📊')
      m.reply(printUserInfo + '\n\n' +
         printUserStats, {
         externalAdReply: {
            title: botName,
            body: greeting(),
            thumbnail: await fetchAsBuffer(profilePicture),
            largeThumbnail: true
         }
      })
   }
}