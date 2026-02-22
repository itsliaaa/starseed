import { parseCommand } from '../../lib/Serialize.js'

export default {
   command: ['+cmdstic', '-cmdstic'],
   category: 'partner',
   async run(m, {
      sock,
      setting,
      isPrefix,
      command,
      text: body
   }) {
      const quoted = m.quoted
      if (quoted?.type !== 'stickerMessage')
         return m.reply('💭 Reply sticker message.')
      const base64Hash = quoted.fileSha256.toString('base64')
      if (command === '+cmdstic') {
         const {
            prefix: stickerPrefix,
            command: stickerCommand,
            text: stickerText,
            args: stickerArgs
         } = parseCommand(body)
         if (!stickerPrefix || !stickerCommand)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} ${isPrefix}menu`)
         setting.stickerCommand[base64Hash] = {
            body,
            prefix: stickerPrefix,
            command: stickerCommand,
            text: stickerText,
            args: stickerArgs
         }
         m.reply('✅ Successfully updating sticker command.')
      }
      else if (command === '-cmdstic') {
         if (!(base64Hash in setting.stickerCommand))
            return m.reply('❌ No sticker command found in database.')
         delete setting.stickerCommand[base64Hash]
         m.reply('✅ Successfully delete sticker command.')
      }
   },
   partner: true
}