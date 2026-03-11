import { isMimeImage, isMimeVideo, isMimeWebP } from '../../lib/Utilities.js'

export default {
   async run(m, {
      sock,
      user,
      group,
      isPartner
   }) {
      if (!group.autoSticker || !m.msg?.mimetype) return
      const mimetype = m.msg?.mimetype
      if (
         user.limit > 0 &&
         !isMimeWebP(mimetype) &&
         (
            isMimeImage(mimetype) ||
            isMimeVideo(mimetype)
         )
      ) {
         const buffer = await m.download()
         if (!Buffer.isBuffer(buffer)) return
         if (!isPartner)
            --user.limit
         sock.sendMedia(m.chat, buffer, '', m, {
            sticker: true
         })
      }
   },
   group: true
}