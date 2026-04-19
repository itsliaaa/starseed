import { isLidUser } from '@itsliaaa/baileys'

import { INACTIVE_THRESHOLD, SCHEMA } from '../../lib/Constants.js'
import { extractNumber } from '../../lib/Serialize.js'
import { frame } from '../../lib/Utilities.js'

export default {
   command: ['+warn', '-warn', 'add', 'kick', 'promote', 'demote', 'sider'],
   category: 'admin tools',
   async run(m, {
      sock,
      group,
      groupMetadata,
      setting,
      isPrefix,
      command,
      args
   }) {
      if (command === 'sider') {
         const [option] = args
         const timestampMs = Date.now()
         const inactiveMembers = groupMetadata.participants.reduce((acc, x) => {
            const memberId = x.phoneNumber
            if (!memberId || x.admin) return acc
            const memberData = group.participants[memberId]
            if (!memberData || memberData.messages < 1 || (timestampMs - memberData.lastSeen) > INACTIVE_THRESHOLD)
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
      const userId = extractNumber(m)
      if (!userId)
         return m.reply(
            frame('EXAMPLE', [
               `${isPrefix + command} <reply user message>`,
               `${isPrefix + command} @0`,
               `${isPrefix + command} ${m.sender.split('@')[0]}`
            ], '👉🏻')
         )
      if (isLidUser(userId))
         return m.reply('❌ LID detected, can\'t manage member.')
      if (userId.startsWith(ownerNumber))
         return m.reply('❌ Can\'t manage owner member data.')
      if (userId === sock.user.decodedId)
         return m.reply('❌ Can\'t manage bot member data.')
      if (setting.partner.includes(userId))
         return m.reply('❌ Can\'t manage partner member data.')
      const participants = group.participants
      if (command === '+warn') {
         if (!participants[userId])
            participants[userId] = {
               ...SCHEMA.Participant
            }
         if (participants[userId].warningPoint < 5)
            ++participants[userId].warningPoint
         await m.reply(`✅ Added +1 warning point for @${userId.split('@')[0]}.`)
         if (participants[userId].warningPoint >= 5) 
            sock.groupParticipantsUpdate(m.chat, [userId], 'remove')
      }
      else if (command === '-warn') {
         if (!participants[userId])
            participants[userId] = {
               ...SCHEMA.Participant
            }
         if (participants[userId].warningPoint < 1)
            return m.reply(`❌ @${userId.split('@')[0]} warning point already 0.`)
         --participants[userId].warningPoint
         m.reply(`✅ Reduced -1 warning point for @${userId.split('@')[0]}.`)
      }
      else {
         const isUserInGroup = groupMetadata.participants.some(participant => participant.id === userId || participant.phoneNumber === userId)
         if (!isUserInGroup)
            return m.reply('❌ User not found in this group.')
         const action = command === 'kick' ?
            'remove' :
            command
         const [json] = await sock.groupParticipantsUpdate(m.chat, [userId], action)
         if (json.status == 200)
            return m.reply(`✅ Successfully ${command} @${userId.split('@')[0]}.`)
         m.reply(`❌ Failed to ${command} @${userId.split('@')[0]}.`)
      }
   },
   group: true,
   admin: true,
   botAdmin: true
}