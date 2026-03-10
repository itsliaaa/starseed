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

import { isMimeAudio, isMimeImage, isMimeVideo } from './Utilities.js'

export const request = async (url, options = {}) => {
   const controller = new AbortController()
   const timeoutId = setTimeout(() =>
      controller.abort(), requestTimeout)

   try {
      const response = await fetch(url, {
         ...options,
         signal: controller.signal
      })

      if (!response.ok) {
         await response.body?.cancel()
         throw new Error(response.statusText)
      }

      const contentType = response.headers.get('content-type')

      if (
         isMimeAudio(contentType) ||
         isMimeImage(contentType) ||
         isMimeVideo(contentType) ||
         contentType?.includes('octet')
      )
         return Buffer.from(await response.arrayBuffer())

      if (contentType?.startsWith('text'))
         return await response.text()

      return await response.json()
   }
   catch (error) {
      if (controller.signal.aborted)
         throw new Error(`Request timeout after ${requestTimeout}ms`)
      throw error
   }
   finally {
      clearTimeout(timeoutId)
   }
}

export const getContentType = async (url) => {
   const controller = new AbortController()
   const timeoutId = setTimeout(() =>
      controller.abort(), requestTimeout)

   try {
      const response = await fetch(url, {
         method: 'HEAD',
         signal: controller.signal
      })

      if (!response.ok)
         throw new Error(response.statusText)

      return response.headers.get('content-type')
   }
   catch (error) {
      if (controller.signal.aborted)
         throw new Error(`Request timeout after ${requestTimeout}ms`)
      throw error
   }
   finally {
      clearTimeout(timeoutId)
   }
}

export const deline = async (path = '', params = {}) =>
   request(
      `https://api.deline.web.id/` +
      path + '?' +
      new URLSearchParams(params)
   )

export const faa = async (path = '', params = {}) =>
   request(
      `https://api-faa.my.id/faa/` +
      path + '?' +
      new URLSearchParams(params)
   )

export const nekolabs = async (path = '', params = {}) =>
   request(
      `https://rynekoo-api.hf.space/` +
      path + '?' +
      new URLSearchParams(params)
   )

export const nexray = async (path = '', params = {}) =>
   request(
      `https://api.nexray.web.id/` +
      path + '?' +
      new URLSearchParams(params)
   )

export const zenzxz = async (path = '', params = {}) =>
   request(
      `https://api.zenzxz.my.id/` +
      path + '?' +
      new URLSearchParams(params)
   )