import { isURL } from '../../lib/Utilities.js'

export default {
   command: 'afk',
   category: 'group',
   async run(m, {
      text,
      user
   }) {
      if (isURL(text))
         return m.reply('❌ You can\'t set a link as your AFK reason.')
      user.afkReason = text
      user.afkContext = m
      user.afkTimestamp = Date.now()
      m.reply(`🏷️ @${m.sender.split('@')[0]} is now AFK.`)
   },
   group: true
}