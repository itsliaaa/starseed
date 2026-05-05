import { delay } from '@itsliaaa/baileys'

import { DAY, FAKE_QUOTE, G_US, S_WHATSAPP_NET, SCHEMA } from '../../lib/Constants.js'
import { formatTime, frame, toTime } from '../../lib/Utilities.js'

const checkGroupInvite = async ({ sock, groupInput }) => {
   if (groupInput.includes('chat.whatsapp.com/')) {
      const inviteCode = groupInput.split('chat.whatsapp.com/')[1]?.split(/[\s?]/)[0]
      if (!inviteCode) return null
      try {
         const groupMetadata = await sock.groupGetInviteInfo(inviteCode)
         if (!groupMetadata?.id) return null
         return {
            metadata: groupMetadata,
            inviteCode
         }
      }
      catch {
         return null
      }
   }
   else if (groupInput.endsWith(G_US)) {
      try {
         const groupMetadata = await sock.groupMetadata(groupInput)
         return {
            metadata: groupMetadata,
            inviteCode: null
         }
      }
      catch {
         return null
      }
   }
}

const joinGroup = async ({ sock, groupMetadata, inviteCode }) => {
   try {
      if (groupMetadata?.participants) {
         const isAlreadyJoin = groupMetadata.participants.some(participant => {
            return participant.id === sock.user.decodedLid ||
               participant.phoneNumber === sock.user.decodedId
         })
         if (isAlreadyJoin) return true
      }
      if (!inviteCode) return false
      await sock.groupAcceptInvite(inviteCode)
      return true
   }
   catch {
      return false
   }
}

export default {
   command: ['+rent', '-rent'],
   hidden: ['+sewa', '-sewa'],
   category: 'partner',
   async run(m, {
      sock,
      db,
      store,
      isPrefix,
      command,
      args
   }) {
      if (command === '+rent' || command === '+sewa') {
         if (args.length < 2)
            return m.reply(
               frame('EXAMPLE', [
                  `${isPrefix + command} https://chat.whatsapp.com/kTe5Rrgd5k 28d`,
                  `${isPrefix + command} 1201111111111@g.us 28d`
               ], '👉🏻')
            )
         const groupInput = args[0]
         const days = parseInt(args[1].replace('d', ''))
         m.react('🕒')
         try {
            const data = await checkGroupInvite({ sock, groupInput })
            if (!data?.metadata)
               return m.reply('❌ Group not found or invalid link.')
            const { metadata, inviteCode } = data
            let groupMetadata = store.getGroup(metadata.id)
            let group = db.getGroup(metadata.id)
            if (!groupMetadata || !groupMetadata.participants) {
               groupMetadata = metadata
               store.setGroup(metadata.id, groupMetadata)
            }
            if (!group) {
               group = {
                  ...SCHEMA.Group,
                  id: metadata.id,
                  name: metadata.subject
               }
               db.updateGroup(metadata.id, group)
            }
            const isAlreadyRent = group.rentExpiry > 0
            const expiry = days * DAY
            group.rentExpiry = isAlreadyRent ?
               group.rentExpiry + expiry :
               Date.now() + expiry
            group._notifiedRent = false
            const expiredAt = formatTime(undefined, group.rentExpiry)
            let print = `✅ Successfully add bot access for ${metadata.subject} group and will expired at ${expiredAt}.`
            const isJoined = await joinGroup({ sock, groupMetadata, inviteCode })
            if (isJoined) {
               await delay(3000)
               const printIntro = isAlreadyRent ?
                  `🔄 *Rental Updated!*\n\nThe bot rental has been successfully extended.\n\n- 🕒 Updated duration: *${args[1].toUpperCase()}*\n- 📅 New expiration date: *${expiredAt}*\n\n👉🏻 Send *${isPrefix}menu* to continue using the bot features!` :
                  `👋🏻 *Hi Everyone!*\n\nHello! I'm ${botName}, your bot assistant.\n\n- 🕒 Active rental: *${args[1].toUpperCase()}*\n- 📅 Leaving on: *${expiredAt}*\n\n👉🏻 Send *${isPrefix}menu* to check out what I can do!`
               await sock.sendText(metadata.id, printIntro, FAKE_QUOTE, { mentionAll: true })
            }
            else
               print += `\n\n> ⚠️ Failed to join the group using the invite code. Please add the bot manually by a group admin.`
            m.reply(print)
         }
         catch (error) {
            m.reply('❌ ' + error.message)
         }
      }
      else if (command === '-rent' || command === '-sewa') {
         if (m.isPrivate)
            return m.reply(
               frame('EXAMPLE', [
                  `${isPrefix + command} https://chat.whatsapp.com/kTe5Rrgd5k`,
                  `${isPrefix + command} 1201111111111@g.us`,
                  `${isPrefix + command} <no need to specify an link/ID use this in the group>`
               ], '👉🏻')
            )
         const groupInput = args[0] || m.chat
         m.react('🕒')
         try {
            const data = await checkGroupInvite({ sock, groupInput })
            if (!data?.metadata)
               return m.reply('❌ Group not found or invalid link.')
            const { metadata } = data
            const group = db.getGroup(metadata.id)
            if (!group)
               return m.reply('❌ Group not found.')
            const isInRent = group.rentExpiry > 0
            if (!isInRent)
               return m.reply('❌ Group not in rental session.')
            group.rentExpiry = 0
            group._notifiedRent = false
            const printLeave = `♻️ This group has been removed from the rental session.\nI'll be leaving the group now 👋🏻\n\nIf you'd like to use the bot again, please contact the owner to rent again.`
            await sock.sendText(metadata.id, printLeave, FAKE_QUOTE, { mentionAll: true })
            await delay(3000)
            await sock.groupLeave(metadata.id)
            sock.sendText(m.sender, `✅ Successfully delete ${metadata.subject} group rental session.`, m)
         }
         catch (error) {
            m.reply('❌ ' + error.message)
         }
      }
   },
   partner: true
}