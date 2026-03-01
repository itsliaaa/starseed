import { isMimeAudio, isMimeImage } from '../../lib/Utilities.js'

export default {
   command: ['closegc', 'opengc', 'delete', 'setgcdesc', 'setgcname', 'setgcpp', 'setleft', 'setwelcome', 'upgcsw'],
   category: 'admin tools',
   async run(m, {
      sock,
      group,
      isPrefix,
      command,
      text
   }) {
      if (command === 'closegc') {
         await sock.groupSettingUpdate(m.chat, 'announcement')
         m.reply('✅ Successfully closing the grup.')
      }
      else if (command === 'opengc') {
         await sock.groupSettingUpdate(m.chat, 'not_announcement')
         m.reply('✅ Successfully open the grup.')
      }
      else if (command === 'delete') {
         await sock.sendMessage(m.chat, {
            delete: {
               remoteJid: m.chat,
               fromMe: false,
               id: m.quoted.id,
               participant: m.quoted.sender
            }
         })
         m.reply('✅ Successfully deleted.')
      }
      else if (command === 'setgcdesc') {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} Hi!`)
         if (text.length > 1000)
            return m.reply('❌ Max characters for group description is 1000.')
         await sock.groupUpdateDescription(m.chat, text)
         m.reply('✅ Successfully change the group description.')
      }
      else if (command === 'setgcname') {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} Hi!`)
         if (text.length > 100)
            return m.reply('❌ Max characters for group name is 1000.')
         await sock.groupUpdateSubject(m.chat, text)
         m.reply('✅ Successfully change the group name.')
      }
      else if (command === 'setgcpp') {
         const q = m.quoted?.url ? m.quoted : m
         const mimetype = (q.msg || q).mimetype
         if (!isMimeImage(mimetype))
            return m.reply('💭 Provide an image to change group picture.')
         m.react('🕒')
         await sock.updateProfilePicture(m.chat, await q.download())
         m.reply('✅ Successfully changed.')
      }
      else if (command === 'setleft') {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} Hi +tag, welcome to +grup group, we hope you enjoyed with us!`)
         group.leftMessage = text
         m.reply('✅ Successfully changed left message.')
      }
      else if (command === 'setwelcome') {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} Good bye! +tag`)
         group.welcomeMessage = text
         m.reply('✅ Successfully changed welcome message.')
      }
      else if (command === 'upgcsw') {
         const q = m.quoted ? m.quoted : m
         const body = text ?? q.body
         const mimetype = (q.msg || q).mimetype
         if (!body && !mimetype)
            return m.reply('💭 Provide text or media you would like to send to the group status.')
         m.react('🕒')
         let context
         if (mimetype)
            context = await sock.sendMedia(m.chat, await q.download(), body, null, {
               ptt: isMimeAudio(mimetype),
               groupStatus: true
            })
         else if (body)
            context = await sock.sendText(m.chat, body, null, {
               groupStatus: true
            })
         sock.sendText(m.chat, '✅ Successfully sent group status.', context)
      }
   },
   group: true,
   admin: true,
   botAdmin: true
}