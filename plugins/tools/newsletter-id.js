import { NEWSLETTER_URL_REGEX } from '../../lib/Constants.js'
import { fetchAsBuffer, formatNumber, frame, greeting } from '../../lib/Utilities.js'

export default {
   command: 'channelid',
   hidden: 'idch',
   category: 'tools',
   async run(m, {
      sock,
      isPrefix,
      command,
      args
   }) {
      try {
         if (!args[0])
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} https://whatsapp.com/channel/0029VbBeIi33AzNKAeODXg16`)
         m.react('🕒')
         const match = args[0].match(NEWSLETTER_URL_REGEX)
         if (!match) return m.reply('❌ Invalid URL.')
         const newsletterMetadata = await sock.newsletterMetadata('INVITE', match[1])
         const newsletterPicturePath = newsletterMetadata.thread_metadata?.preview?.direct_path
         let newsletterPicture = newsletterPicturePath ? 'https://pps.whatsapp.net' + newsletterPicturePath : botThumbnail
         const print = frame('CHANNEL INFO', [
            `*ID*: ${newsletterMetadata.id}`,
            `*Name*: ${newsletterMetadata.thread_metadata.name.text}`,
            `*Followers*: ${formatNumber(newsletterMetadata.thread_metadata.subscribers_count)}`,
            `*Status*: ${newsletterMetadata.state.type}`,
            `*Verified*: ${newsletterMetadata.thread_metadata.verification}`
         ], '📢')
         m.reply(print, {
            externalAdReply: {
               title: botName,
               body: greeting(),
               thumbnail: await fetchAsBuffer(newsletterPicture),
               largeThumbnail: true
            }
         })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}