export default {
   command: 'getpp',
   category: 'group',
   async run(m, {
      sock
   }) {
      const userId = m.quoted?.sender || m.sender
      let profilePicture
      try {
         profilePicture = await sock.profilePictureUrl(userId)
      }
      catch {
         return m.reply('❌ User didn\'t put a profile picture.')
      }
      sock.sendMedia(m.chat, profilePicture, '', m)
   },
   group: true
}