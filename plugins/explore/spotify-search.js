import { isJidNewsletter } from '@itsliaaa/baileys'

import { zenzxz } from '../../lib/Request.js'
import { fetchAsBuffer, frame, toTime } from '../../lib/Utilities.js'

export default {
   command: 'spotsearch',
   category: 'explore',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         const keyCache = m.sender + 'spotify-search'
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
            const trackUrl = 'https://open.spotify.com/track/' + result.id
            const data = await zenzxz('download/spotify', {
               url: trackUrl
            })
            if (!data.status)
               return m.reply('❌ Failed to get data.')
            const printMessage = frame('SPOTIFY', [
               `*Title*: ${data.result.title}`,
               `*Artist*: ${data.result.artist}`,
               `*Duration*: ${toTime(data.result.duration_ms)}`
            ], '🎵')
            m.reply(printMessage, {
               externalAdReply: {
                  title: data.result.title,
                  body: '✍🏻 Artist: ' + data.result.artist,
                  thumbnail: await fetchAsBuffer(data.result.thumbnail || botThumbnail),
                  url: trackUrl,
                  sourceUrl: trackUrl,
                  largeThumbnail: true
               }
            })
            sock.sendMedia(m.chat, data.result.download_url, '', m, {
               audio: true,
               ptt: isJidNewsletter(m.chat)
            })
         }
         else {
            if (!text)
               return m.reply(`👉🏻 *Example*: ${isPrefix + command} heat abnormal`)
            m.react('🕒')
            const data = await zenzxz('search/spotify', {
               q: text
            })
            if (!data.status || !data.result?.success)
               return m.reply('❌ Failed to get data.')
            const flattedResult = data.result.results.flatMap((result, index, array) => {
               const lines = [
                  `${index + 1}. ${result.title}`,
                  `*Artist*: ${result.artists}`
               ]
               if (index !== array.length - 1)
                  lines.push('')
               return lines
            })
            const printHowTo = frame('HOW TO GET', [
               `To get the music use \`${isPrefix + command} <number>\` command`,
               `*Example*: ${isPrefix + command} 1`
            ], '📄')
            const printList = frame('SPOTIFY SEARCH', flattedResult, '🎶')
            ExploreSession.set(keyCache, data.result.results)
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