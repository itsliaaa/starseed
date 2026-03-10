export default {
   command: 'quoted',
   category: 'group',
   async run(m, {
      store,
      sock
   }) {
      try {
         const q = m.quoted
         if (!q)
            return m.reply('💭 Reply message that contain quoted.')
         const message = store.getMessage(q)
         if (!message?.quoted)
            return m.reply('❌ Can\'t load message.')
         const quoted = store.getMessage(message.quoted)
         if (!quoted)
            return m.reply('❌ Can\'t load message.')
         const context = await sock.sendMessage(m.chat, {
            forward: quoted,
            force: true
         })
         sock.sendText(m.chat, `✉️ Message from @${quoted.sender.split('@')[0]}.`, context)
      }
      catch (error) {
         console.error(error)
         m.reply('❌ Failed to get quoted message.')
      }
   },
   group: true
}