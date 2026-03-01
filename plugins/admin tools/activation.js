export default {
   command: ['mute', 'unmute'],
   category: 'admin tools',
   async run(m, {
      group,
      command
   }) {
      if (command === 'mute') {
         if (group.mute)
          return m.reply('❌ Already muted.')
         group.mute = true
         m.reply('✅ Successfully muted.')
      }
      else {
         if (!group.mute)
          return m.reply('❌ Already activated.')
         group.mute = false
         m.reply('✅ Successfully activated.')
      }
   },
   group: true,
   admin: true
}