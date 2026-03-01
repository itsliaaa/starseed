/**
 * Preparing the view once forwarder feature.
 * Waiting for Baileys updates.
 */

export default {
   async run(m, {
      sock,
      group,
      isPartner,
      isAdmin
   }) {
      return false
      if (
         group.viewOnceForwarder &&
         !isPartner &&
         !isAdmin &&
         m.msg.viewOnce &&
         !m.fromMe
      ) {
         m.msg.viewOnce = false
         const context = await sock.sendMessage(m.chat, {
            forward: m,
            force: true
         })
         sock.sendText(m.chat, `👁️ View once message from @${m.sender.split('@')[0]}.`, context)
      }
   },
   group: true
}