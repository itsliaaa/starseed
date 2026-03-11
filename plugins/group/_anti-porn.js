import { downscaleImage, isMimeImage, isMimeVideo, isMimeWebP, persistToFile } from '../../lib/Utilities.js'

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
         buffer = await downscaleImage(buffer)
      const filePath = await persistToFile(buffer)
      let isPorn
      if (isMimeImage(m.msg.mimetype))
         isPorn = await SightEngine.detectImage(filePath)
      else if (isMimeVideo(m.msg.mimetype) && m.msg.seconds < 60)
         isPorn = await SightEngine.detectVideo(filePath)
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