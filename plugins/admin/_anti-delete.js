export default {
   async run(m, {
      sock,
      store,
      group,
      isPartner,
      isAdmin
   }) {
      if (
         group.antiDelete &&
         !isPartner &&
         !isAdmin &&
         m.type === 'protocolMessage' &&
         m.msg?.type == 0 &&
         !m.fromMe
      ) {
         const message = store.getMessage(m.msg.key)
         if (message?.message) {
            const context = await sock.sendMessage(m.chat, {
               forward: message,
               force: true
            })
            sock.sendText(m.chat, `🗑️ Deleted message from @${m.sender.split('@')[0]}.`, context)
         }
      }
   },
   group: true
}