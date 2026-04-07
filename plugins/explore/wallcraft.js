import { nexray } from '../../lib/Request.js'
import { frame } from '../../lib/Utilities.js'

export default {
   command: 'wallcraft',
   category: 'explore',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         const keyCache = m.sender + 'wallcraft'
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
            sock.sendMedia(m.chat, result.url, result.description, m)
         }
         else {
            if (!text)
               return m.reply(`👉🏻 *Example*: ${isPrefix + command} nature`)
            m.react('🕒')
            const data = await nexray('search/wallcraft', {
               q: text
            })
            if (!data.status)
               return m.reply('❌ Failed to get data.')
            const flattedResult = data.result.flatMap((result, index, array) => {
               const lines = [
                  `${index + 1}. ${result.id}`,
                  `*Tags*: ${result.tags.join(', ')}`
               ]
               if (index !== array.length - 1)
                  lines.push('')
               return lines
            })
            const printHowTo = frame('HOW TO GET', [
               `To show the lyric use \`${isPrefix + command} <number>\` command`,
               `*Example*: ${isPrefix + command} 1`
            ], '📄')
            const printList = frame('WALLCRAFT', flattedResult, '🖼️')
            ResultCache.set(keyCache, data.result)
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