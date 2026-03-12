export default {
   async run(m, {
      sock,
      group,
      isPartner,
      isAdmin
   }) {
      if (
         group.memberLabelUpdate &&
         !isPartner &&
         !isAdmin &&
         m.type === 'protocolMessage' &&
         m.msg.type == 30 &&
         m.msg.memberLabel?.label
      ) 
         sock.sendText(m.chat, `🏷️ @${m.sender.split('@')[0]} updated their member label to: ${m.msg.memberLabel.label}.`)
   },
   group: true
}