import { isMimeImage, isMimeVideo, isMimeWebP, persistToFile, resizeImage } from '../../lib/Utilities.js'

import SightEngine from '../../lib/Components/SightEngine.js'

import { handleWarning } from './_anti-link.js'

export default {
   async run(m, {
      sock,
      group,
      isPartner,
      isAdmin
   }) {
      if (
         !group.antiPorn ||
         isPartner ||
         isAdmin ||
         !m.msg?.mimetype ||
         !apiUser ||
         !apiSecret
      ) return
      let buffer = await m.download()
      if (!Buffer.isBuffer(buffer)) return
      if (isMimeWebP(m.msg.mimetype))
         buffer = await resizeImage(buffer)
      const filePath = await persistToFile(buffer)
      let isPorn
      if (isMimeImage(m.msg.mimetype))
         isPorn = await SightEngine.detectImage(filePath)
            .catch(() => false)
      else if (isMimeVideo(m.msg.mimetype) && m.msg.seconds < 60)
         isPorn = await SightEngine.detectVideo(filePath)
            .catch(() => false)
      if (isPorn) {
         const participant = group.participants[m.sender]
         handleWarning(m, {
            sock,
            participant,
            note: `3 warnings and you’ll be removed. No more nsfw content.`,
            max: 3
         })
      }
   },
   group: true,
   botAdmin: true
}