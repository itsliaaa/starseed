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

import * as cheerio from 'cheerio'
import { fileTypeFromBuffer } from 'file-type'
import { createHash } from 'crypto'

import { request } from './Request.js'
import { isURL } from './Utilities.js'

export const catbox = async (buffer) => {
   if (!Buffer.isBuffer(buffer))
      throw new TypeError('Invalid input type, expects buffer')

   const check = await fileTypeFromBuffer(buffer)
   if (!check?.ext)
      throw new Error('Invalid media type')

   const form = new FormData()
   const blob = new Blob([buffer], { type: check.mime })
   form.append('reqtype', 'fileupload')
   form.append('fileToUpload', blob, `file.${check.ext}`)

   const data = await request('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: form
   })

   if (!isURL(data))
      throw new Error('Invalid response')

   return data.trim()
}

export const uguu = async (buffer) => {
   if (!Buffer.isBuffer(buffer))
      throw new TypeError('Invalid input type, expects buffer')

   const check = await fileTypeFromBuffer(buffer)
   if (!check?.ext)
      throw new Error('Invalid media type')

   const form = new FormData()
   const blob = new Blob([buffer], { type: check.mime })
   form.append('files[]', blob, `file.${check.ext}`)

   const data = await request('https://uguu.se/upload.php', {
      method: 'POST',
      body: form
   })

   if (!data?.files?.[0]?.url)
      throw new Error('Invalid response')

   return data.files[0].url.trim()
}

export const tiktok = async (url) => {
   const { payload, cookie } = await (async () => {
      const response = await fetch('https://musicaldown.com/en')
      if (!response.ok) {
         await response.body?.cancel()
         throw new Error(response.statusText)
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      const payload = {}
      $('#submit-form input[name]').each((_, el) => {
         payload[el.attribs.name] = el.attribs.value ?? ''
      })

      const urlField = Object.keys(payload).find(key => !payload[key])
      if (urlField)
         payload[urlField] = url

      return {
         payload,
         cookie: response.headers.getSetCookie().join('; ')
      }
   })()
   if (!payload || !cookie)
      throw new Error('Failed to get credentials')

   const html = await request('https://musicaldown.com/download', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
         Cookie: cookie,
         Origin: 'https://musicaldown.com',
         Referer: 'https://musicaldown.com/',
         'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
      },
      body: new URLSearchParams(payload)
   })

   const $ = cheerio.load(html)

   let audio,
      media = []
   $('a.download').each((i, elem) => {
      const $elem = $(elem)
      const type = $elem.data('event')?.replace('_download_click', '')
      const src = $elem.attr('href')
      if (src) {
         if (type === 'mp3')
            audio = src
         else
            media.push({
               type,
               url: src
            })
      }
   })

   $('.card-image img').each((i, el) => {
      const src = $(el).attr('src')
      if (src)
         media.push({
            type: 'image',
            url: src
         })
   })

   return {
      title: $('.video-desc').text().trim(),
      audio,
      media
   }
}

export const instagram = async (url) => {
   const ts = Math.floor(Date.now() / 1000)

   const html = await request('https://reelsvideo.io/reel/DUU67gXiTwU/?igsh=MTZxdm1yd3pnN3Rvdg==/', {
      method: 'POST',
      headers: {
         Accept: '*/*',
         'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
         'Hx-Request': 'true',
         'Hx-Current-Url': 'https://reelsvideo.io/',
         'Hx-Target': 'target',
         Origin: 'https://reelsvideo.io',
         Referer: 'https://reelsvideo.io/',
         'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
      },
      body: new URLSearchParams({
         id: url,
         locale: 'en',
         'cf-turnstile-response': '',
         tt: createHash('md5')
            .update(ts + 'X-Fc-Pp-Ty-eZ')
            .digest('hex'),
         ts
      })
   })

   const $ = cheerio.load(html)

   const username = $('.bg-white span.text-400-16-18').first().text().trim() || null

   const media = []
   $('a.type_videos').each((_, el) => {
      const href = $(el).attr('href')
      if (href)
         media.push({
            type: 'video',
            url: href
         })
   })

   $('a.type_images').each((_, el) => {
      const href = $(el).attr('href')
      if (href)
         media.push({
            type: 'image',
            url: href
         })
   })

   $('a.type_audio').each((_, el) => {
      const href = $(el).attr('href')
      const id = $(el).attr('data-id')
      if (href && id)
         media.push({
            id,
            type: 'audio',
            url: href
         })
   })

   return {
      username,
      media
   }
}