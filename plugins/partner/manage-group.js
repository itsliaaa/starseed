import { DAY, FAKE_QUOTE } from '../../lib/Constants.js'
import { formatTime, frame } from '../../lib/Utilities.js'

const ID_EXTRACT_REGEX = /(?<=\*ID\*: )[\d-]+@g\.us/g

export default {
   command: 'groups',
   hidden: 'gc',
   category: 'partner',
   async run(m, {
      sock,
      db,
      store,
      isPrefix,
      command,
      args
   }) {
      if (!args.length) {
         const groups = Array.from(db.groups.values())
         const flattedGroups = groups.flatMap((group, index, array) => {
            const lines = [
               `${index + 1}. ${group.name}`,
               `*ID*: ${group.id}`
            ]
            if (index !== array.length - 1)
               lines.push('')
            return lines
         })
         const printHowTo = frame('HOW TO MANAGE', [
            `You can choose group to manage the group's settings`,
            `*Example*: \`${isPrefix + command} 1\``
         ], '📄')
         const printGroups = frame('GROUPS', flattedGroups, '🧑‍🧑‍🧒‍🧒')
         return m.reply(printHowTo + '\n\n' +
            printGroups)
      }
      const q = m.quoted
      if (!q || !q.text.includes(`You can choose group to manage the group's settings`))
         return m.reply(`💭 Reply group lists message response from \`${isPrefix}groups\`.`)
      ID_EXTRACT_REGEX.lastIndex = 0
      const [number, option, ...text] = args
      const groupId = q.text.match(ID_EXTRACT_REGEX)[Number(number) - 1]
      const group = db.getGroup(groupId)
      if (!group)
         return m.reply('❌ Group not found.')
      const groupMetadata = store.getGroup(group.id)
      if (!groupMetadata)
         return m.reply('❌ Group metadata not found.')
      const participants = groupMetadata.participants
      let isBotAdmin = false
      for (let i = 0, participantsLength = participants.length; i < participantsLength; i++) {
         const member = participants[i]
         if (member.admin) {
            if (!isBotAdmin && member.id === sock.user.decodedLid)
               isBotAdmin = true
            if (isBotAdmin) break
         }
      }
      if (option === 'close') {
         if (!isBotAdmin)
            return m.reply('❌ Bot is not an admin in that group.')
         await sock.groupSettingUpdate(group.id, 'announcement')
         await m.reply('✅ Successfully closing the grup.')
         sock.sendText(group.id, '📣 Group closed by bot staff.', FAKE_QUOTE)
      }
      else if (option === 'leave') {
         await sock.sendText(group.id, '👋🏻 Good bye!', FAKE_QUOTE, { mentionAll: true })
         await sock.groupLeave(group.id)
         m.reply('✅ Bot successfully leave the group.')
      }
      else if (option === 'link') {
         if (!isBotAdmin)
            return m.reply('❌ Bot is not an admin in that group.')
         const code = await sock.groupInviteCode(group.id)
         const print = frame('GROUP LINK', [
            'https://chat.whatsapp.com/' + code
         ], '🏷️')
         m.reply(print)
      }
      else if (option === 'mute') {
         group.mute = true
         await m.reply('✅ Bot successfully muted.')
         sock.sendText(group.id, '📣 Bot muted in this group by bot staff.', FAKE_QUOTE)
      }
      else if (option === 'open') {
         if (!isBotAdmin)
            return m.reply('❌ Bot is not an admin in that group.')
         await sock.groupSettingUpdate(m.chat, 'not_announcement')
         await m.reply('✅ Successfully open the grup.')
         sock.sendText(group.id, '📣 Group opened by bot staff.', FAKE_QUOTE)
      }
      else if (option === 'reset') {
         group.rentExpiry = 0
         group._notifiedRent = false
         await m.reply('✅ Bot duration has been reset.')
         sock.sendText(group.id, '📣 Bot duration in this group has been reset and will stay forever.', FAKE_QUOTE)
      }
      else if (option === 'unmute') {
         group.mute = false
         await m.reply('✅ Bot successfully activated.')
         sock.sendText(group.id, '📣 Bot unmuted in this group by bot staff.', FAKE_QUOTE)
      }
      else if (option?.endsWith('d')) {
         const days = parseInt(option)
         const isAlreadyRent = group.rentExpiry > 0
         const expiry = DAY * days
         group.rentExpiry = isAlreadyRent ?
            group.rentExpiry + expiry :
            Date.now() + expiry
         group._notifiedRent = false
         const expiredAt = formatTime(undefined, group.rentExpiry)
         await m.reply(`✅ Successfully add bot access for ${group.name} group and will expired at ${expiredAt}.`)
         sock.sendText(group.id, `📣 Bot access in this group is valid until ${expiredAt}.`, FAKE_QUOTE)
      }
      else
         m.reply(printHowTo(isPrefix, command))
   },
   partner: true
}

const printHowTo = (isPrefix, command) =>
   frame('HOW TO MANAGE', [
      '1. Set bot duration in the group',
      `*Example*: ${isPrefix + command} <list number> 30d`, '',
      '2. Close the group',
      `*Example*: ${isPrefix + command} <list number> close`, '',
      '3. Leave the group',
      `*Example*: ${isPrefix + command} <list number> leave`, '',
      '4. Get the group link',
      `*Example*: ${isPrefix + command} <list number> link`, '',
      '5. Mute the bot in the group',
      `*Example*: ${isPrefix + command} <list number> mute`, '',
      '6. Open the group',
      `*Example*: ${isPrefix + command} <list number> open`, '',
      '7. Reset the bot duration',
      `*Example*: ${isPrefix + command} <list number> reset`, '',
      '8. Unmute the bot in the group',
      `*Example*: ${isPrefix + command} <list number> unmute`
   ], '🔧')