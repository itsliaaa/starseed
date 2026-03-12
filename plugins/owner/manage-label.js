export default {
   command: ['setlabel', 'dellabel'],
   category: 'owner',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      if (command === 'setlabel') {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} WhatsApp bot`)
         if (text.length > 30)
            return m.reply('❌ Max characters for label is 30.')
         await sock.updateMemberLabel(m.chat, text)
         m.reply('✅ Successfully set member label for bot.')
      }
      else if (command === 'dellabel') {
         await sock.updateMemberLabel(m.chat, '')
         m.reply('✅ Successfully delete member label for bot.')
      }
   },
   owner: true,
   group: true
}