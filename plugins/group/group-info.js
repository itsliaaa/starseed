import { fetchAsBuffer, frame, greeting, formatTime } from '../../lib/Utilities.js'

export default {
   command: 'groupinfo',
   hidden: 'gcinfo',
   category: 'group',
   async run(m, {
      sock,
      group,
      groupMetadata,
      command
   }) {
      const groupOwner = groupMetadata.ownerPn.split('@')[0]
      const groupAdmin = groupMetadata.participants.filter(participant => participant.admin)
      const groupPicture = await sock.profilePicture(m.chat)
      const printGroupInfo = frame('GROUP INFO', [
         `*ID*: ${groupMetadata.id}`,
         `*Name*: ${groupMetadata.subject}`,
         `*Admin*: ${groupAdmin.length}`,
         `*Member*: ${groupMetadata.size}`,
         `*Owner*: @${groupOwner}`
      ], '👥')
      const printModeration = frame('MODERATION', [
         `*Auto Sticker*: ${group.autoSticker ? '✅' : '❌'}`,
         `*Anti Bot*: ${group.antiBot ? '✅' : '❌'}`,
         `*Anti Delete*: ${group.antiDelete ? '✅' : '❌'}`,
         `*Anti Porn*: ${group.antiPorn ? '✅' : '❌'}`,
         `*Anti Group Status*: ${group.antiGroupStatus ? '✅' : '❌'}`,
         `*Anti Link*: ${group.antiLink ? '✅' : '❌'}`,
         `*Anti Rejoin*: ${group.antiRejoin ? '✅' : '❌'}`,
         `*Anti Spam*: ${group.antiSpam ? '✅' : '❌'}`,
         `*Anti Tag All*: ${group.antiTagAll ? '✅' : '❌'}`,
         `*Anti Tag Status*: ${group.antiTagStatus ? '✅' : '❌'}`,
         `*Anti Toxic*: ${group.antiToxic ? '✅' : '❌'}`,
         `*Anti WhatsApp Link*: ${group.antiWALink ? '✅' : '❌'}`,
         `*Member Label Update*: ${group.memberLabelUpdate ? '✅' : '❌'}`,
         `*Sholat Reminder*: ${group.sholatReminder ? '✅' : '❌'}`,
         `*Left Message*: ${group.left ? '✅' : '❌'}`,
         `*Welcome Message*: ${group.welcome ? '✅' : '❌'}`
      ], '🔧')
      const printStatus = frame('STATUS', [
         `*Admin Only*: ${group.adminOnly ? '✅' : '❌'}`,
         `*Mute Bot*: ${group.mute ? '✅' : '❌'}`,
         `*Expired At*: ${group.rentExpiry > 0 ? formatTime(undefined, group.rentExpiry) : 'Unset'}`
      ], '💬')
      m.reply(printGroupInfo + '\n\n' +
         printModeration + '\n\n' +
         printStatus, {
         title: botName,
         description: greeting(),
         thumbnail: await fetchAsBuffer(groupPicture),
         width: 512,
         height: 512,
         largeThumbnail: true
      })
   },
   group: true
}