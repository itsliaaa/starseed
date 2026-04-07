import { stickerLy } from '../../lib/Scraper.js'
import { createSticker, frame, shuffleArray } from '../../lib/Utilities.js'

export default {
   command: 'stickerly',
   category: 'explore',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         const keyCache = m.sender + 'stickerly'
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
            const stickers = []
            for (const url of result.resourceFiles)
               stickers.push({
                  data: await createSticker(result.resourceUrlPrefix + url, {
                     stickerPackPublisher
                  })
               })
            await sock.sendMessage(m.chat, {
               cover: {
                  url: botThumbnail
               },
               stickers,
               name: stickerPackName,
               publisher: stickerPackPublisher,
               description: footer
            }, {
               quoted: m
            })
         }
         else {
            if (!text)
               return m.reply(`👉🏻 *Example*: ${isPrefix + command} cat`)
            m.react('🕒')
            const data = await stickerLy(text)
            const sliced = shuffleArray(data)
               .splice(0, 10)
            const flattedResult = sliced.flatMap((result, index, array) => {
               const lines = [
                  `${index + 1}. ${result.name}`,
                  `*Created by*: ${result.authorName}`
               ]
               if (index !== array.length - 1)
                  lines.push('')
               return lines
            })
            const printHowTo = frame('HOW TO GET', [
               `To get the stickers use \`${isPrefix + command} <number>\` command`,
               `*Example*: ${isPrefix + command} 1`
            ], '📄')
            const printList = frame('STICKER.LY', flattedResult, '📦')
            ResultCache.set(keyCache, sliced)
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