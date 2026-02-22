import { JPG_CONVERSION_ARGS } from '../../lib/Constants.js'
import { nekolabs } from '../../lib/Request.js'
import { ffmpeg } from '../../lib/Utilities.js'

export default {
   command: ['animagine', 'cartoony', 'dreamshaper', 'newreality'],
   category: 'ai',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} cat eat banana`)
         m.react('🕒')
         const path = command === 'animagine' ?
            'animagine/xl-3.1' :
            command === 'cartoony' ?
               'cartoony-anime' :
               command === 'dreamshaper' ?
                  'dreamshaper-xl' :
                  command
         const data = await nekolabs('image.gen/' + path, {
            prompt: text,
            ratio: '16:9'
         })
         if (!data.success)
            return m.reply('❌ Failed to get data.')
         const filePath = await ffmpeg(
            data.result,
            [],
            JPG_CONVERSION_ARGS,
            'jpg'
         )
         sock.sendMedia(m.chat, filePath, '', m)
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}