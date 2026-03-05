import { fetchAsBuffer, frame, greeting } from '../../lib/Utilities.js'

export default {
   command: 'profile',
   hidden: 'me',
   category: 'user info',
   async run (m, {
      sock,
      db,
      setting,
      isPartner
   }) {
      const userId = m.quoted ?
         m.quoted.sender :
         m.mentionedJid[0] ||
            m.sender
      const userData = db.getUser(userId)
      if (!userData)
         return m.reply('❌ User not found.')
      let warningPoint
      if (m.isGroup)
         warningPoint = db.getGroup(m.chat).participants[userId]?.warningPoint
      const profilePicture = await sock.profilePicture(userData.jid)
      const printUserInfo = frame('USER INFO', [
         `*Name*: ${userData.name}`,
         `*Limit*: ${isPartner ? '`ꝏ Unlimited`' : userData.limit}`
      ], '👤')
      const printUserStats = frame('USER STATS', [
         `*Hit Command*: ${userData.commandUsage}x`,
         `*Warning*: ${warningPoint ?? '-'} point`,
         `*Partner*: ${setting.partner.includes(userData.jid) ? '✅' : '❌'}`,
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