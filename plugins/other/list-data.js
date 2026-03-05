import { frame } from '../../lib/Utilities.js'

export default {
   command: ['listbanned', 'listtoxic'],
   category: 'other',
   async run(m, {
      sock,
      db,
      setting,
      command
   }) {
      try {
         if (command === 'listbanned') {
            const users = [...new Set(db.users.values())]
               .filter(user => user.banned)
            if (!users.length)
               return m.reply('❌ No users have been banned at this time.')
            const printList = frame('BANNED LIST', users.map(user => '@ ' + user.jid.split('@')[0]), '🚫')
            m.reply(printList)
         }
         else if (command === 'listtoxic') {
            const printList = frame('TOXIC LIST', setting.forbiddenWords.map(word => word), '🗣️')
            m.reply(printList)
         }
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   }
}