import { isMimeImage, isMimeVideo } from '../../lib/Utilities.js'

export default {
   async run(m, {
      sock,
      user,
      group,
      isPartner
   }) {
      if (!group.autoSticker || !m.msg?.mimetype)
         return
      if (!isMimeImage(m.msg.mimetype) || !isMimeVideo(m.msg.mimetype))
         return
      if (
         user.limit > 0 &&
         (m.msg.seconds <= 10 || !m.msg?.mimetype) &&
         !m.fromMe
      ) {
         const buffer = await m.download()
         if (!Buffer.isBuffer(buffer))
            return
         if (!isPartner)
            --user.limit
         sock.sendMedia(m.chat, buffer, '', m, {
            sticker: true
         })
      }
   },
   group: true
}