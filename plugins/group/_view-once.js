/**
 * Preparing the automatic view once forwarder feature.
 * Waiting for Baileys updates.
 */

export default {
   async run(m, {
      sock,
      group,
      isPartner,
      isAdmin
   }) {
      if (
         group.viewOnceForwarder &&
         !isPartner &&
         !isAdmin &&
         !m.fromMe &&
         m.msg.viewOnce
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