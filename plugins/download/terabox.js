import { zenzxz } from '../../lib/Request.js'
import { formatTime, frame, isURL } from '../../lib/Utilities.js'

export default {
   command: 'terabox',
   hidden: 'tb',
   category: 'download',
   async run(m, {
      sock,
      isPrefix,
      command,
      args
   }) {
      try {
         const keyCache = m.sender + 'terabox'
         const userPreviousResult = ResultCache.get(keyCache)
         if (
            args[0] &&
            !isNaN(args[0]) &&
            userPreviousResult
         ) {
            const result = userPreviousResult[Number(args[0]) - 1]
            if (!result)
               return m.reply(`❌ Invalid input.`)
            m.react('🕒')
            const printDetail = frame('TERABOX', [
               `*File Name*: ${result.server_filename}`,
               `*File Size*: ${result.formatted_size}`,
               `*Uploaded at*: ${formatTime(undefined, result.server_mtime * 1000)}`
            ], '🗃️')
            sock.sendMedia(m.chat, result.direct_link, printDetail, m, {
               document: true,
               fileName: result.server_filename
            })
         }
         else {
            if (!args[0])
               return m.reply(`👉🏻 *Example*: ${isPrefix + command} https://www.1024tera.com/wap/share/filelist?surl=YrsEOjBk-sgaswPZ6NVozA`)
            if (!isURL(args[0]))
               return m.reply('❌ Invalid URL.')
            m.react('🕒')
            const data = await zenzxz('download/terabox', {
               url: args[0]
            })
            if (!data.status)
               return m.reply('❌ Failed to get data.')
            const flattedResult = data.result.list.flatMap((result, index, array) => {
               const lines = [
                  `${index + 1}. ${result.server_filename}`,
                  `*Size*: ${result.formatted_size}`
               ]
               if (index !== array.length - 1)
                  lines.push('')
               return lines
            })
            const printHowTo = frame('HOW TO GET', [
               `To get the media use \`${isPrefix + command} <number>\` command`,
               `*Example*: ${isPrefix + command} 1`
            ], '📄')
            const printList = frame('TERABOX LISTS', flattedResult, '🗃️')
            ResultCache.set(keyCache, data.result.list)
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