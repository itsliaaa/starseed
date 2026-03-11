/**
 * This file is part of the Starseed Bot WhatsApp project, solely developed and maintained by Lia Wynn.
 * https://github.com/itsliaaa/starseed
 *
 * All rights reserved.
 *
 * - You are NOT allowed to copy, rewrite, modify, redistribute, or reuse this file in any form.
 * - You are NOT allowed to claim this file or any part of this project as your own.
 * - This credit notice must NOT be removed or altered.
 * - This file may ONLY be used within the Starseed project.
 */

import { openAsBlob } from 'fs'
import { basename } from 'path'

import { request } from '../Request.js'

const IMAGE_ENDPOINT = 'https://api.sightengine.com/1.0/check.json'
const VIDEO_ENDPOINT = 'https://api.sightengine.com/1.0/video/check-sync.json'

export default {
   detectImage: async (filePath) => {
      const form = new FormData()
      form.append('media', await openAsBlob(filePath), basename(filePath))
      form.append('models', 'nudity-2.1,gore-2.0,violence')
      form.append('api_user', apiUser)
      form.append('api_secret', apiSecret)

      const data = await request(IMAGE_ENDPOINT, {
         method: 'POST',
         body: form
      })
      if (data.status !== 'success') return false

      return data.nudity?.sexual_activity >= 0.50 ||
         data.nudity?.erotica >= 0.50 ||
         data.nudity?.suggestive >= 0.50 ||
         data.nudity?.very_suggestive >= 0.50 ||
         data.gore?.prob >= 0.50 ||
         data.violence?.prob >= 0.50
   },

   detectVideo: async (filePath) => {
      const form = new FormData()
      form.append('media', await openAsBlob(filePath), basename(filePath))
      form.append('models', 'nudity-2.1,gore-2.0,violence')
      form.append('api_user', apiUser)
      form.append('api_secret', apiSecret)

      const data = await request(VIDEO_ENDPOINT, {
         method: 'POST',
         body: form
      })
      if (data.status !== 'success') return false

      let score = 0
      for (const info of data.data.frames) {
         if (score >= 0.50) break
         score += info.nudity?.sexual_activity || 0
         score += info.nudity?.erotica || 0
         score += info.nudity?.suggestive || 0
         score += info.nudity?.very_suggestive || 0
         score += info.gore?.prob || 0
         score += info.violence?.prob || 0
      }

      return score >= 0.50
   }
}