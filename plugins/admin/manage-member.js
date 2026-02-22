import { isPnUser, S_WHATSAPP_NET } from '@itsliaaa/baileys'

import { INACTIVE_THRESHOLD, SCHEMA } from '../../lib/Constants.js'
import { frame } from '../../lib/Utilities.js'

const polishId = (id) => {
   if (isPnUser(id))
      return id
   if (id.includes('@'))
      id = id.split('@')[0]
   return id + S_WHATSAPP_NET
}

export default {
   command: ['+warn', '-warn', 'add', 'kick', 'promote', 'demote', 'sider'],
   category: 'admin',
   async run(m, {
      sock,
      db,
      group,
      groupMetadata,
      isPrefix,
      command,
      args
   }) {
      if (command === 'sider') {
         const [option] = args
         const now = Date.now()
         const inactiveMembers = groupMetadata.participants.reduce((acc, x) => {
            const memberId = x.phoneNumber
            if (!memberId || x.admin) return acc
            const memberData = group.participants[memberId]
            if (!memberData || memberData.messages < 1 || (now - memberData.lastSeen) > INACTIVE_THRESHOLD)
               acc.push(memberId)
            return acc
         }, [])
         if (!inactiveMembers.length) return m.reply('❌ There\'s no sider right now.')
         const mentions = inactiveMembers.map(x => `@${x.split('@')[0]}`)
         if (option === '-y') {
            const printMessage = frame('SIDER', [
               '👋🏻 Good bye! Admin has decided to remove you for being inactive.'
            ], '👀')
            const printParticipants = frame('PARTICIPANTS', mentions, '📌')
            await m.reply(printMessage + '\n\n' +
               printParticipants)
            return client.groupParticipantsUpdate(m.chat, inactiveMembers, 'remove')
         }
         else {
            const printMessage = frame('SIDER', [
               `To remove ${inactiveMembers.length} inactive members, use the following command: *${isPrefix + command} -y*`
            ], '👀')
            const printParticipants = frame('PARTICIPANTS', mentions, '📌')
            return m.reply(printMessage + '\n\n' +
               printParticipants)
         }
      }
      const rawId = m.quoted?.sender || args[0]
      if (!rawId)
         return m.reply('💭 Reply user message or input it manually starts with country code.')
      const userId = polishId(rawId)
      const participants = group.participants
      if (command === '+warn') {
         if (!participants[userId])
            participants[userId] = {
               ...SCHEMA.Participant
            }
         participants[userId].warningPoint += 1
         await m.reply(`✅ Added +1 warning point for @${userId.split('@')[0]}.`)
         if (participants[userId].warningPoint >= 5)
            sock.groupParticipantsUpdate(m.chat, [userId], 'remove')
      }
      else if (command === '-warn') {
         if (!participants[userId])
            participants[userId] = {
               ...SCHEMA.Participant
            }
         participants[userId].warningPoint -= 1
         return m.reply(`✅ Reduced -1 warning point for @${userId.split('@')[0]}.`)
      }
      else {
         const isUserInGroup = groupMetadata.participants.some(p => p.id === userId || p.phoneNumber === userId)
         if (!isUserInGroup)
            return m.reply('❌ User not found in this group.')
         const [json] = await sock.groupParticipantsUpdate(m.chat, [userId], command === 'kick' ?
            'remove' :
            command
         )
         if (json.status == 200)
            return m.reply(`✅ Successfully ${command} @${userId.split('@')[0]}.`)
         m.reply(`❌ Failed to ${command} @${userId.split('@')[0]}.`)
      }
   },
   group: true,
   admin: true,
   botAdmin: true
}