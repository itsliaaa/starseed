import { getStickerPack } from '../../lib/Scraper.js'
import { createSticker, frame, shuffleArray } from '../../lib/Utilities.js'

const CDN_URL = 'https://s3.getstickerpack.com/'

export default {
   command: 'stickerpack',
   hidden: 'skpack',
   category: 'explore',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         const keyCache = m.sender + 'sticker-pack'
         const userPreviousResult = ExploreSession.get(keyCache)
         if (
            text &&
            !isNaN(text) &&
            userPreviousResult
         ) {
            const result = userPreviousResult[Number(text) - 1]
            if (!result)
               return m.reply(`❌ Invalid input.`)
            m.react('🕒')
            const data = await getStickerPack.detail(result.slug)
            const stickers = []
            for (const value of data.images)
               stickers.push({
                  data: await createSticker(CDN_URL + value.url, {
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
               description: data.about || footer
            }, {
               quoted: m
            })
         }
         else {
            if (!text)
               return m.reply(`👉🏻 *Example*: ${isPrefix + command} cat`)
            m.react('🕒')
            const data = await getStickerPack.search(text)
            const sliced = shuffleArray(data)
               .splice(0, 10)
            const flattedResult = sliced.flatMap((result, index, array) => {
               const lines = [
                  `${index + 1}. ${result.title}`,
                  `*Created by*: ${result.user.username || '-'}`
               ]
               if (index !== array.length - 1)
                  lines.push('')
               return lines
            })
            const printHowTo = frame('HOW TO GET', [
               `To get the stickers use \`${isPrefix + command} <number>\` command`,
               `*Example*: ${isPrefix + command} 1`
            ], '📄')
            const printList = frame('STICKER PACKS', flattedResult, '📦')
            ExploreSession.set(keyCache, sliced)
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