import { fetchAsBuffer, frame, greeting } from '../../lib/Utilities.js'

export default {
   command: 'gcinfo',
   category: 'group',
   async run(m, {
      sock,
      group,
      groupMetadata,
      command
   }) {
      const groupOwner = groupMetadata.ownerPn.split('@')[0]
      const groupAdmin = groupMetadata.participants.filter(participant => participant.admin)
      let groupPicture
      try {
         groupPicture = await sock.profilePictureUrl(m.chat)
      }
      catch {
         groupPicture = botThumbnail
      }
      const printGroupInfo = frame('GROUP INFO', [
         `*ID*: ${groupMetadata.id}`,
         `*Name*: ${groupMetadata.subject}`,
         `*Admin*: ${groupAdmin.length}`,
         `*Member*: ${groupMetadata.participants.length}`,
         `*Owner*: @${groupOwner}`
      ], '👥')
      const printModeration = frame('MODERATION', [
         `*Auto Sticker*: ${group.autoSticker ? '✅' : '❌'}`,
         `*Anti Delete*: ${group.antiDelete ? '✅' : '❌'}`,
         `*Anti Link*: ${group.antiLink ? '✅' : '❌'}`,
         `*Anti Spam*: ${group.antiSpam ? '✅' : '❌'}`,
         `*Anti Tag Status*: ${group.antiTagStatus ? '✅' : '❌'}`,
         `*Anti Toxic*: ${group.antiToxic ? '✅' : '❌'}`,
         `*Anti WhatsApp Link*: ${group.antiWALink ? '✅' : '❌'}`,
         `*Sholat Reminder*: ${group.sholatReminder ? '✅' : '❌'}`,
         `*Left Message*: ${group.left ? '✅' : '❌'}`,
         `*Welcome Message*: ${group.welcome ? '✅' : '❌'}`
      ], '🔧')
      const printStatus = frame('STATUS', [
         `*Admin Only*: ${group.adminOnly ? '✅' : '❌'}`,
         `*Mute*: ${group.mute ? '✅' : '❌'}`
      ], '💬')
      m.reply(printGroupInfo + '\n\n' +
         printModeration + '\n\n' +
         printStatus, {
         externalAdReply: {
            title: botName,
            body: greeting(),
            thumbnail: await fetchAsBuffer(groupPicture),
            largeThumbnail: true
         }
      })
   },
   group: true
}