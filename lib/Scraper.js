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

import { delay } from '@itsliaaa/baileys'
import { fileTypeFromBuffer } from 'file-type'
import { LRUCache } from 'lru-cache'
import { createHash } from 'crypto'
import ytsearch from 'yt-search'

import { MINUTE } from './Constants.js'
import { request } from './Request.js'
import { isURL } from './Utilities.js'

const YTCache = new LRUCache({
   max: 256,
   ttl: 30 * MINUTE,
   updateAgeOnGet: false,
   updateAgeOnHas: false,
   ttlAutopurge: true
})

let cheerioLoader

export const catbox = async (buffer) => {
   if (!(buffer instanceof Buffer))
      throw new TypeError('Invalid input type, expects buffer')

   const check = await fileTypeFromBuffer(buffer)
   if (!check?.ext)
      throw new Error('Invalid media type')

   const form = new FormData()
   const blob = new Blob([buffer], { type: check.mime })
   form.append('reqtype', 'fileupload')
   form.append('fileToUpload', blob, `${Date.now()}.${check.ext}`)

   const data = await request('https://catbox.moe/user/api.php', {
      method: 'POST',
      headers: {
         Origin: 'https://catbox.moe',
         Referer: 'https://catbox.moe/',
         'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
      },
      body: form
   })

   if (!isURL(data))
      throw new Error('Invalid response')

   return data.trim()
}

export const litterbox = async (buffer) => {
   if (!(buffer instanceof Buffer))
      throw new TypeError('Invalid input type, expects buffer')

   const check = await fileTypeFromBuffer(buffer)
   if (!check?.ext)
      throw new Error('Invalid media type')

   const form = new FormData()
   const blob = new Blob([buffer], { type: check.mime })
   form.append('reqtype', 'fileupload')
   form.append('time', '72h')
   form.append('fileToUpload', blob, `${Date.now()}.${check.ext}`)

   const data = await request('https://litterbox.catbox.moe/resources/internals/api.php', {
      method: 'POST',
      headers: {
         Origin: 'https://litterbox.catbox.moe',
         Referer: 'https://litterbox.catbox.moe/',
         'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
      },
      body: form
   })

   if (!isURL(data))
      throw new Error('Invalid response')

   return data.trim()
}

export const puticu = async (buffer) => {
   if (!(buffer instanceof Buffer))
      throw new TypeError('Invalid input type, expects buffer')

   const check = await fileTypeFromBuffer(buffer)
   if (!check?.ext)
      throw new Error('Invalid media type')

   const data = await request('https://put.icu/upload/', {
      method: 'PUT',
      headers: {
         Accept: 'application/json',
         'Content-Type': check?.mime || 'application/octet-stream'
      },
      body: buffer
   })

   const resultUrl = data.direct_url || data.url

   if (!resultUrl)
      throw new Error('Invalid response')

   return resultUrl.trim()
}

export const uguu = async (buffer) => {
   if (!(buffer instanceof Buffer))
      throw new TypeError('Invalid input type, expects buffer')

   const check = await fileTypeFromBuffer(buffer)
   if (!check?.ext)
      throw new Error('Invalid media type')

   const form = new FormData()
   const blob = new Blob([buffer], { type: check.mime })
   form.append('files[]', blob, `${Date.now()}.${check.ext}`)

   const data = await request('https://uguu.se/upload.php', {
      method: 'POST',
      headers: {
         Origin: 'https://uguu.se',
         Referer: 'https://uguu.se/',
         'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
      },
      body: form
   })

   const resultUrl = data.files?.[0]?.url

   if (!resultUrl)
      throw new Error('Invalid response')

   return resultUrl.trim()
}

export const quax = async (buffer) => {
   if (!(buffer instanceof Buffer))
      throw new TypeError('Invalid input type, expects buffer')

   const check = await fileTypeFromBuffer(buffer)
   if (!check?.ext)
      throw new Error('Invalid media type')

   const form = new FormData()
   const blob = new Blob([buffer], { type: check.mime })
   form.append('files[]', blob, `${Date.now()}.${check.ext}`)

   const data = await request('https://qu.ax/upload.php', {
      method: 'POST',
      headers: {
         Origin: 'https://qu.ax',
         Referer: 'https://qu.ax/',
         'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
      },
      body: form
   })

   const resultUrl = data.files?.[0]?.url
   if (!resultUrl)
      throw new Error('Invalid response')

   return resultUrl
}

export const reelsvideo = async (url) => {
   const timestampMs = Date.now() / 1000 | 0

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
            .update(timestampMs + 'X-Fc-Pp-Ty-eZ')
            .digest('hex'),
         ts: timestampMs
      })
   })

   const load = cheerioLoader ??= (await import('cheerio')).load
   const $ = load(html)

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

export const meloboom = async (query) => {
   const html = await request(`https://meloboom.com/en/search/${encodeURIComponent(query)}`)
   const load = cheerioLoader ??= (await import('cheerio')).load
   const $ = load(html)

   const result = []
   $('#__next > main > section > div.jsx-2244708474.container > div > div > div > div:nth-child(4) > div > div > div > ul > li').each((a, b) => {
      result.push({
         title: $(b).find('h4').text(),
         source: 'https://meloboom.com/'+$(b).find('a').attr('href'),
         audio: $(b).find('audio').attr('src')
      })
   })

   if (!result.length)
      throw new Error('Failed to get data')

   return result
}

export const getStickerPack = Object.freeze({
   search: async (query) => {
      const json = await request('https://getstickerpack.com/api/v1/stickerdb/search', {
         method: 'POST',
         body: JSON.stringify({
            query,
            page: Math.floor(Math.random() * 3) + 1
         })
      })

      const data = json.data

      if (!data?.length)
         throw new Error('Failed to get data')

      return data
   },
   detail: async (slug) => {
      const json = await request('https://getstickerpack.com/api/v1/stickerdb/stickers/' + slug)

      const data = json.data

      if (!data?.images?.length)
         throw new Error('Failed to get data')

      return json.data
   }
})

export const stickerLy = async (query) => {
   const json = await request('https://api.sticker.ly/v4/stickerPack/smartSearch', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'User-Agent': 'androidapp.stickerly/3.17.0 (Linux; Android 10; Redmi Note 8 Build/QKQ1.200114.002; wv; in-ID)'
      },
      body: JSON.stringify({
         keyword: query,
         enabledKeywordSearch: true,
         filter: {
            extendSearchResult: false,
            sortBy: 'RECOMMENDED',
            languages: [
               'ALL'
            ],
            minStickerCount: 5,
            searchBy: 'ALL',
            stickerType: 'ALL'
         }
      })
   })

   const stickerPacks = json.result?.stickerPacks

   if (!stickerPacks?.length)
      throw new Error('Failed to get data')

   return stickerPacks
}

export const tikwm = async (url) => {
   const json = await request('https://www.tikwm.com/api/', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
         Origin: 'https://www.tikwm.com',
         Referer: 'https://www.tikwm.com/',
         'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
         'X-Requested-With': 'XMLHttpRequest'
      },
      body: new URLSearchParams({
         url,
         hd: 1
      })
   })

   if (json.code != 0)
      throw new Error('Failed to get data')

   return json.data
}

export const ytdl = async (url, output = { type: 'audio', format: 'mp3', quality: '128kbps' }, maxAttempts = 10) => {
   const body = JSON.stringify({ url, output })
   const keyCache = url + body

   const cachedResponse = YTCache.get(keyCache)
   if (cachedResponse)
      return cachedResponse

   const headers = {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'Content-Type': 'application/json',
      Origin: 'https://snakeloader.com',
      Referer: 'https://snakeloader.com/',
      'Sec-Ch-Ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
      'Sec-Ch-Ua-Mobile': '?1',
      'Sec-Ch-Ua-Platform': '"Android"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
   }

   const { statusUrl } = await request('https://ytdl.y2mp3.co/api/v2/download', {
      method: 'POST',
      headers,
      body
   })

   let delayMs = 10000
   let attempts = 0

   while (attempts < maxAttempts) {
      attempts++

      const data = await request(statusUrl, { headers })
      const downloadUrl = data.downloadUrl
      if (downloadUrl) {
         YTCache.set(keyCache, downloadUrl)
         return downloadUrl
      }

      await delay(delayMs)
   }

   throw new Error('Failed to get data (reached max retries)')
}

export const yts = async (query) => {
   const keyCache = query

   const cachedResponse = YTCache.get(keyCache)
   if (cachedResponse)
      return cachedResponse

   const data = await ytsearch(query)
   if (!data.all?.length)
      throw new Error('Failed to get data')

   YTCache.set(keyCache, data)
   return data
}