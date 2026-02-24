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

import { delay, isJidGroup, S_WHATSAPP_NET, WA_DEFAULT_EPHEMERAL } from '@itsliaaa/baileys'
import { fileTypeFromBuffer, fileTypeFromFile, fileTypeStream } from 'file-type'
import { once } from 'events'
import { spawn } from 'child_process'
import { createWriteStream } from 'fs'
import { access, constants, lstat, unlink, readdir, readFile, rename, rm, writeFile } from 'fs/promises'
import { join, resolve } from 'path'
import { PassThrough, Readable } from 'stream'
import { pipeline } from 'stream/promises'
import { Jimp, ResizeStrategy } from 'jimp'
import PQueue from 'p-queue'

import { SECOND, MINUTE, HOUR, DAY, BRAT_GIF_ARGS, FFMPEG_CONCAT_ARGS, MENTION_REGEX, WEBP_EXIF_HEADER, WHATSAPP_URL_REGEX, IMAGE_TO_WEBP, VIDEO_TO_WEBP, AUDIO_TO_MPEG, AUDIO_TO_OPUS, FONT_MAPS } from './Constants.js'
import { request } from './Request.js'
import { CommandIndex } from './Watcher.js'

const FFMPEG_QUEUE = new PQueue({
   concurrency: ffmpegConcurrency
})

export const isMimeImage = (mime) =>
   mime?.startsWith('image')

export const isMimeVideo = (mime) =>
   mime?.startsWith('video')

export const isMimeGif = (mime) =>
   mime?.endsWith('gif')

export const isMimeWebP = (mime) =>
   mime?.endsWith('webp')

export const isMimeAudio = (mime) =>
   mime?.startsWith('audio')

export const isEmptyObject = (object) => {
   for (const _ in object) return false
   return true
}

export const createFileName = () =>
   `${process.pid}_${performance.now().toString().replace('.', '')}`

export const toTitleCase = (str = 'hello') =>
   String(str).replace(/\b\w/g, c => c.toUpperCase())

export const parseMentions = (text) => {
   if (typeof text !== 'string') return []

   const result = []
   let match

   MENTION_REGEX.lastIndex = 0
   while ((match = MENTION_REGEX.exec(text)) !== null)
      result.push(match[1] + S_WHATSAPP_NET)

   return result
}

export const cleanUpFolder = async (path) => {
   try {
      const stat = await lstat(path)
      if (stat.isFile()) {
         await unlink(path)
         return
      }

      const entries = await readdir(path)
      await Promise.all(
         entries.map(name =>
            rm(join(path, name), { recursive: true, force: true })
         )
      )
   }
   catch (error) {
      console.error('❌ ', error.message)
   }
}

export const isFileExists = async (path) => {
   try {
      await lstat(path)
      return true
   }
   catch (error) {
      if (error.code === 'ENOENT') return false
      throw error
   }
}

export const isURL = (input) => {
   if (typeof input !== 'string') return false
   return URL.canParse(input)
}

export const isWhatsAppURL = (body) => {
   if (!body.includes('whatsapp.com')) return false
   return WHATSAPP_URL_REGEX.test(body)
}

export const fetchAsBuffer = async (url) => {
   if (Buffer.isBuffer(url)) return url

   if (typeof url !== 'string') return null

   if (isURL(url))
      return await request(url)

   return await readFile(url)
}

export const getDiskStats = async () => {
   const df = spawn('df', ['-k'])

   let output = ''
   df.stdout.on('data', chunk => {
      output += chunk
   })

   await once(df, 'close')

   const lines = output.trim().split('\n').slice(1)
   let primaryDisk = null

   for (const line of lines) {
      const parts = line.split(/\s+/)
      const [fs, size, used, avail, , mount] = parts

      if (
         fs.includes('tmpfs') ||
         fs.includes('devtmpfs') ||
         fs.includes('overlay') ||
         mount.startsWith('/dev') ||
         mount.startsWith('/proc')
      )
         continue

      const totalBytes = parseInt(size) * 1024

      if (!primaryDisk || totalBytes > primaryDisk.total)
         primaryDisk = {
            total: totalBytes,
            used: parseInt(used) * 1024,
            free: parseInt(avail) * 1024,
            mount
         }
   }

   return primaryDisk
}

export const ffmpeg = async (inputPath, inputArgs = [], outputArgs = [], extension) =>
   FFMPEG_QUEUE.add(async () => {
      if (!extension)
         throw new Error('Extension required')

      const fileName = createFileName() + '.' + extension
      const filePath = join(process.cwd(), temporaryFolder, fileName)

      const ff = spawn('ffmpeg', [
         '-y',
         '-loglevel', 'quiet',
         '-threads', ffmpegConcurrency.toString(),
         '-nostdin',
         ...inputArgs,
         '-i', inputPath,
         ...outputArgs,
         filePath
      ], {
         stdio: 'ignore'
      })

      let timeout
      const timeoutId = setTimeout(() => {
         timeout = true
         ff.kill('SIGKILL')
      }, ffmpegTimeout)

      try {
         const [code] = await once(ff, 'close')

         if (code !== 0)
            throw new Error(`FFmpeg failed (${code})`)

         return filePath
      }
      catch (error) {
         if (timeout)
            throw new Error(`FFmpeg timeout after ${ffmpegTimeout}ms`)
         throw error
      }
      finally {
         clearTimeout(timeoutId)
         ff.removeAllListeners()
      }
   })

export const persistToFile = async (source) => {
   if (typeof source === 'string' && !isURL(source)) return source

   let readable,
      check
   if (
      source instanceof ArrayBuffer ||
      source instanceof Uint8Array ||
      Buffer.isBuffer(source)
   ) {
      source = Buffer.from(source)
      readable = Readable.from(source)
      check = await fileTypeFromBuffer(source)
   }
   else if (typeof source === 'string' && isURL(source)) {
      const response = await fetch(source)

      if (!response.ok)
         throw new Error(response.statusText)

      readable = await fileTypeStream(
         Readable.fromWeb(response.body)
      )
      check = readable.fileType
   }
   else
      throw new Error('Invalid source type')

   const extension = check?.ext || 'txt'
   const fileName = resolve(process.cwd(), temporaryFolder, createFileName())
   const filePath = fileName + '.' + extension

   await pipeline(
      readable,
      createWriteStream(filePath)
   )

   return filePath
}

export const getNextMidnight = (timezone) => {
   const now = new Date()

   const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
   })

   const parts = formatter.formatToParts(now)
   const year = parts.find(p => p.type === 'year').value
   const month = parts.find(p => p.type === 'month').value
   const day = parts.find(p => p.type === 'day').value

   const midnightLocal = new Date(`${year}-${month}-${day}T00:00:00`)
   midnightLocal.setDate(midnightLocal.getDate() + 1)

   return midnightLocal.getTime() - now.getTime()
}

export const createExif = (json) => {
   const jsonBuffer = Buffer.from(JSON.stringify(json))
   const exif = Buffer.concat([WEBP_EXIF_HEADER, jsonBuffer])

   exif.writeUIntLE(jsonBuffer.length, 14, 4)

   return exif
}

/* ********** EXPERIMENTAL FUNCTIONS ********** */
export const ensureVP8X = (webpBuffer) => {
   const firstChunk = webpBuffer.toString('ascii', 12, 16)

   if (firstChunk === 'VP8X') return webpBuffer

   if (firstChunk !== 'VP8 ' && firstChunk !== 'VP8L')
      throw new Error('Unsupported WebP format')

   const width = 512 - 1
   const height = 512 - 1

   const vp8xChunk = Buffer.alloc(18)
   vp8xChunk.write('VP8X', 0)
   vp8xChunk.writeUInt32LE(10, 4)

   vp8xChunk[8] = 0

   vp8xChunk.fill(0, 9, 12)

   vp8xChunk.writeUIntLE(width, 12, 3)
   vp8xChunk.writeUIntLE(height, 15, 3)

   const before = webpBuffer.slice(0, 12)
   const after = webpBuffer.slice(12)

   const newBuffer = Buffer.concat([before, vp8xChunk, after])
   newBuffer.writeUInt32LE(newBuffer.length - 8, 4)

   return newBuffer
}

export const writeExif = (webpBuffer, metadataJson) => {
   webpBuffer = ensureVP8X(webpBuffer)

   const exifData = createExif(metadataJson)

   let offset = 12
   let vp8xOffset = -1

   while (offset < webpBuffer.length) {
      const type = webpBuffer.toString('ascii', offset, offset + 4)
      const size = webpBuffer.readUInt32LE(offset + 4)

      if (type === 'VP8X') {
         vp8xOffset = offset
         break
      }

      offset += 8 + size + (size % 2)
   }

   webpBuffer[vp8xOffset + 8] |= 0b00001000

   const exifChunkHeader = Buffer.alloc(8)
   exifChunkHeader.write('EXIF', 0)
   exifChunkHeader.writeUInt32LE(exifData.length, 4)

   const exifChunk = Buffer.concat([
      exifChunkHeader,
      exifData,
      exifData.length % 2 ? Buffer.from([0x00]) : Buffer.alloc(0)
   ])

   const newBuffer = Buffer.concat([webpBuffer, exifChunk])
   newBuffer.writeUInt32LE(newBuffer.length - 8, 4)

   return newBuffer
}

export const levenshtein = (value, other, insensitive) => {
   if (value === other) return 0

   let length = value.length
   let lengthOther = other.length

   if (length === 0) return lengthOther
   if (lengthOther === 0) return length

   if (length > lengthOther) {
      const temp = value
      value = other
      other = temp
      const tempLen = length
      length = lengthOther
      lengthOther = tempLen
   }

   if (insensitive) {
      value = value.toLowerCase()
      other = other.toLowerCase()
   }

   const row = new Uint32Array(length + 1)

   for (let i = 0; i <= length; i++)
      row[i] = i

   for (let i = 1; i <= lengthOther; i++) {
      let prev = i
      const otherChar = other.charCodeAt(i - 1)

      for (let j = 1; j <= length; j++) {
         const current = value.charCodeAt(j - 1) === otherChar
            ? row[j - 1]
            : Math.min(
                 row[j - 1],
                 prev,
                 row[j]
              ) + 1

         row[j - 1] = prev
         prev = current
      }
      row[length] = prev
   }

   return row[length]
}
/* ********** ********** ********** ********** */

export const downscaleImage = async (media, width = 512, height = -1) => {
   const image = await Jimp.read(media)

   const resizeOptions = height && height > 0
      ? { w: width, h: height, mode: ResizeStrategy.BILINEAR }
      : { w: width, mode: ResizeStrategy.BILINEAR }

   return await image.resize(resizeOptions)
      .getBuffer('image/jpeg', { quality: 80 })
}

export const createSticker = async (media, options = {}) => {
   if (!media)
      throw new Error('No media provided')

   media = await persistToFile(media)

   let mimeType = options.mimetype
   if (!mimeType) {
      const check = await fileTypeFromFile(media)
      mimeType = check?.mime
   }

   if (isMimeWebP(mimeType))
      media = media
   else if (isMimeVideo(mimeType) || isMimeGif(mimeType))
      media = await videoToWebP(media)
   else if (isMimeImage(mimeType))
      media = await imageToWebP(media)
   else
      throw new Error('Invalid media input')

   media = await fetchAsBuffer(media)

   return writeExif(media, {
      'sticker-pack-id': 'itsliaaa',
      'sticker-pack-name': options.stickerPackName ?? stickerPackName,
      'sticker-pack-publisher': options.stickerPackPublisher ?? stickerPackPublisher,
      'emojis': ['✨'],
      'accessibility-text': botName
   })
}

export const bratSticker = async (text = 'Hi') =>
   persistToFile(`https://aqul-brat.hf.space/?text=${encodeURIComponent(text)}`)

export const bratVideoSticker = async (text = 'Hi') => {
   const texts = text.split(' ')
   const tempDir = resolve(process.cwd(), temporaryFolder)

   const files = await Promise.all(
      texts.map((_, i) =>
         persistToFile(`https://aqul-brat.hf.space/?text=${encodeURIComponent(texts.slice(0, i + 1).join(' '))}`)
      )
   )

   const list = files.map(f => `file '${resolve(tempDir, f)}'\nduration 0.4`).join('\n') 
      + `\nfile '${resolve(tempDir, files[files.length - 1])}'\nduration 3\n`

   const listPath = resolve(tempDir, `${createFileName()}.txt`)
   await writeFile(listPath, list)

   return await ffmpeg(listPath, FFMPEG_CONCAT_ARGS, BRAT_GIF_ARGS, 'gif')
}

export const greeting = (timeZone = localTimezone) => {
   const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      hour12: false
   })

   const hour = Number(formatter.format(new Date()))

   if (hour >= 4 && hour < 10) return 'Good Morning 🌄'
   if (hour >= 10 && hour < 15) return 'Good Afternoon ☀️'
   if (hour >= 15 && hour < 18) return 'Good Evening 🌆'
   return 'Good Night 🌙'
}

export const medal = (index) => {
   if (index === 0) return '🥇'
   if (index === 1) return '🥈'
   if (index === 2) return '🥉'
   return index + 1 + '.'
}

export const toTime = (ms) => {
   const sign = ms < 0 ? '-' : ''
   ms = Math.abs(ms)

   const d = (ms / DAY) | 0
   const h = (ms / HOUR) % 24 | 0
   const m = (ms / MINUTE) % 60 | 0
   const s = (ms / SECOND) % 60 | 0

   return (
      sign +
      (d ? `${d}d ` : '') +
      `${String(h).padStart(2, '0')}h ` +
      `${String(m).padStart(2, '0')}m ` +
      `${String(s).padStart(2, '0')}s`
   )
}

export const findTopSuggestions = (input) => {
   const results = []

   for (const cmd of CommandIndex.keys()) {
      const diff = Math.abs(cmd.length - input.length)
      if (diff > 5) continue

      const distance = levenshtein(input, cmd)
      const maxLength = input.length

      let similarity = (1 - distance / maxLength) * 100

      if (cmd.includes(input))
         similarity += 25

      if (similarity >= 50)
         results.push({
            command: cmd,
            similarity: similarity
         })
   }

   return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
}

export const formatNumber = (number) =>
   number.toLocaleString('en-US')

export const formatSize = (bytes) => {
   if (bytes < 1024) return bytes + ' B'
   if (bytes < 1024 ** 2) return (bytes / 1024).toFixed(1) + ' KB'
   if (bytes < 1024 ** 3) return (bytes / 1024 ** 2).toFixed(1) + ' MB'
   if (bytes < 1024 ** 4) return (bytes / 1024 ** 3).toFixed(1) + ' GB'
   return (bytes / 1024 ** 4).toFixed(1) + ' TB'
}

export const style = (text, style = 0) => {
   const map = FONT_MAPS[Number(style)] || FONT_MAPS[0]

   let result = ''
   for (const char of text)
      result += map[char] || char

   return result
}

export const frame = (title, lines = [], icon = '✦') => {
   const top =
      '╭' +
      '─'.repeat(1) +
      `✦ ${icon} *${style(title)}*`

   const content = lines.map(l => `│ ${l}`)

   const bottom =
      '╰' +
      '─'.repeat(3) +
      '✦'

   return [
      top,
      ...content,
      bottom
   ]
      .join('\n')
}

export const messageLogger = (message) =>
   console.log(
      '\n' +
      `🔔 Received ${message.type} from ${message.sender?.split('@')[0] || '-'} (${message.pushName || message.verifiedBizName}) in ${message.chat}` +
      '\n' +
      message.body
   )

export const applySchema = (target, schema) => {
   for (const key in schema)
      if (!(key in target))
         target[key] = schema[key]
}

export const toArray = (value) =>
   typeof value === 'string'
      ? [value]
      : Array.isArray(value)
         ? value
         : []

export const shuffleArray = (array) => {
   if (!Array.isArray(array)) return [array]

   for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
   }

   return array
}

export const randomInteger = (min, max) =>
   Math.floor(
      Math.random() * (max - min + 1)
   ) + min

export const fetchThumbnail = async () =>
   fetchAsBuffer(botThumbnail)

export const imageToWebP = async (media) =>
   ffmpeg(
      media,
      [],
      IMAGE_TO_WEBP,
      'webp'
   )

export const videoToWebP = async (media) =>
   ffmpeg(
      media,
      [],
      VIDEO_TO_WEBP,
      'webp'
   )

export const toAudio = async (media) =>
   ffmpeg(
      media,
      [],
      AUDIO_TO_MPEG,
      'mp3'
   )

export const toPTT = async (media) =>
   ffmpeg(
      media,
      [],
      AUDIO_TO_OPUS,
      'opus'
   )

export const Sender = (sock) => {
   sock.sendText = async (jid, text = '', quoted, options = {}, extra = {}) => {
      await sock.sendPresenceUpdate('composing', jid)

      text = typeof text === 'string' ?
         text :
         JSON.stringify(text, null, 3)

      return await sock.sendMessage(jid, {
         ...options,
         text,
         mentions: parseMentions(text)
      }, {
         ephemeralExpiration: !isJidGroup(jid) && WA_DEFAULT_EPHEMERAL,
         ...extra,
         quoted
      })
   }

   sock.sendMedia = async (jid, source, caption = '', quoted, options = {}, extra = {}) => {
      try {
         await sock.sendPresenceUpdate('composing', jid)

         source = await persistToFile(source)

         caption = typeof caption === 'string' ?
            caption :
            JSON.stringify(caption, null, 3)

         let media,
            mimetype
         if (options.sticker) {
            source = await createSticker(source, options)

            media = source
            mimetype = 'image/webp'
         }
         else if (options.ptt) {
            await sock.sendPresenceUpdate('recording', jid)

            source = await toPTT(source)
            media = { url: source }
            mimetype = 'audio/ogg; codecs=opus'
         }
         else if (options.audio) {
            source = await toAudio(source)

            media = { url: source }
            mimetype = 'audio/mpeg'
         }
         else {
            const check = await fileTypeFromFile(source)

            media = { url: source }
            mimetype = check?.mime || 'text/plain'
         }

         const method = options.document ?
            'document' :
            options.sticker ?
               'sticker' :
               isMimeAudio(mimetype) ?
                  'audio' :
                  isMimeImage(mimetype) ?
                     'image' :
                     isMimeVideo(mimetype) ?
                        'video' :
                         'document'

         delete options.audio
         delete options.document
         delete options.sticker
         delete options.stickerPackName
         delete options.stickerPackPublisher

         return await sock.sendMessage(jid, {
            ...options,
            [method]: media,
            caption,
            mimetype,
            gifPlayback: isMimeGif(mimetype),
            mentions: parseMentions(caption)
         }, {
            ephemeralExpiration: !isJidGroup(jid) && WA_DEFAULT_EPHEMERAL,
            ...extra,
            quoted
         })
      }
      catch (error) {
         return await sock.sendText(jid, '❌ Failed to get data : ' + error.message, quoted)
      }
   }

   sock.profilePicture = async (jid) => {
      try {
         return await sock.profilePictureUrl(jid)
      }
      catch {
         return './lib/Media/profile.jpg'
      }
   }
}