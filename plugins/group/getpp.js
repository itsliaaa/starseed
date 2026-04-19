import { isLidUser } from '@itsliaaa/baileys'

import { extractNumber } from '../../lib/Serialize.js'

export default {
   command: 'getpp',
   category: 'group',
   async run(m, {
      sock,
      setting
   }) {
      const userId = extractNumber(m) || m.sender
      if (isLidUser(userId))
         return m.reply('❌ LID detected, can\'t get user profile picture.')
      if (userId.startsWith(ownerNumber))
         return m.reply('❌ Can\'t get owner profile picture.')
      if (userId === sock.user.decodedId)
         return m.reply('❌ Can\'t get bot profile picture.')
      if (setting.partner.includes(userId))
         return m.reply('❌ Can\'t get partner profile picture.')
      let profilePicture
      try {
         profilePicture = await sock.profilePictureUrl(userId)
      }
      catch {
         return m.reply('❌ User didn\'t put a profile picture.')
      }
      sock.sendMedia(m.chat, profilePicture, '', m)
   },
   group: true,
   premium: true
}