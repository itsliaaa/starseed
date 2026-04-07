import { isJidNewsletter } from '@itsliaaa/baileys'
import ytsearch from 'yt-search'

import { nexray } from '../../lib/Request.js'
import { frame, formatNumber } from '../../lib/Utilities.js'

export default {
   command: 'ytsearch',
   hidden: ['yts', 'ytsa', 'ytsv'],
   category: 'explore',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         const keyCache = m.sender + 'youtube-search'
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
            if (result.seconds > 1440)
               return m.reply('❌ Video is too long. Maximum duration is 24 minutes.')
            const shouldAsAudio = command === 'ytsa'
            const path = shouldAsAudio ?
               'ytmp3' :
               'v1/ytmp4'
            const data = await nexray('downloader/' + path, {
               url: result.url
            })
            if (!data.status)
               return m.reply('❌ Failed to get data.')
            sock.sendMedia(m.chat, data.result.url, result.title, m, {
               audio: shouldAsAudio,
               ptt: shouldAsAudio && isJidNewsletter(m.chat)
            })
         }
         else {
            if (!text)
               return m.reply(`👉🏻 *Example*: ${isPrefix + command} abnormal heat`)
            m.react('🕒')
            const data = await ytsearch(text)
            if (!data.all?.length)
               return m.reply('❌ Failed to get data.')
            const flattedResult = data.all.flatMap((result, index, array) => {
               const lines = [
                  `${index + 1}. ${result.title}`,
                  `*Views*: ${formatNumber(result.views || 0)}`,
                  `*Duration*: ${result.timestamp || '0:00'}`,
                  `*Uploaded*: ${result.ago || 'Long time ago'}`
               ]
               if (index !== array.length - 1)
                  lines.push('')
               return lines
            })
            const printHowTo = frame('HOW TO GET', [
               `To get the video use \`${isPrefix}ytsv <number>\` command and to get the audio use \`${isPrefix}ytsa <number>\` command`,
               `*Example*: ${isPrefix}ytsv 1`
            ], '📄')
            const printList = frame('YOUTUBE SEARCH', flattedResult, '🎥')
            ResultCache.set(keyCache, data.all)
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