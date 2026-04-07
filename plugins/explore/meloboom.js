import { meloboom } from '../../lib/Scraper.js'
import { frame } from '../../lib/Utilities.js'

export default {
   command: 'meloboom',
   category: 'explore',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         const keyCache = m.sender + 'meloboom'
         const userPreviousResult = ResultCache.get(keyCache)
         if (
            text &&
            !isNaN(text) &&
            userPreviousResult
         ) {
            const result = userPreviousResult[Number(text) - 1]
            if (!result)
               return m.reply(`❌ Invalid input.`)
            m.react('🕒')
            sock.sendMedia(m.chat, result.audio, '', m, {
               audio: true
            })
         }
         else {
            if (!text)
               return m.reply(`👉🏻 *Example*: ${isPrefix + command} samsung`)
            m.react('🕒')
            const data = await meloboom(text)
            const flattedResult = data.flatMap((result, index, array) => {
               const lines = [
                  `${index + 1}. ${result.title}`
               ]
               if (index !== array.length - 1)
                  lines.push('')
               return lines
            })
            const printHowTo = frame('HOW TO GET', [
               `To get the ringtone use \`${isPrefix + command} <number>\` command`,
               `*Example*: ${isPrefix + command} 1`
            ], '📄')
            const printList = frame('MELOBOOM', flattedResult, '📢')
            ResultCache.set(keyCache, data)
            m.reply(printHowTo + '\n\n' +
               printList)
         }
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}