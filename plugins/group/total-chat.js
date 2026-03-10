import { frame, medal } from '../../lib/Utilities.js'

export default {
   command: 'totalchat',
   category: 'group',
   async run(m, {
      db,
      group
   }) {
      const sorted = Object.entries(group.participants)
         .map(([jid, participantData]) => {
            const userData = db.getUser(jid)
            return {
               name: userData?.name || 'Somebody',
               messages: participantData?.messages || 0
            }
         })
         .sort((a, b) => b.messages - a.messages)
      const topChat = sorted.slice(0, 10).flatMap((user, index, array) => {
         const lines = [
            `${medal(index)} *Name*: ${user.name}`,
            `*Messages*: ${user.messages}`
         ]
         if (index !== array.length - 1)
            lines.push('')
         return lines
      })
      const printTopChat = frame('TOTAL CHAT', topChat, '💬')
      m.reply(printTopChat)
   },
   group: true
}