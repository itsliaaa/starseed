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
import { fileTypeFromFile } from 'file-type'
import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import { basename } from 'path'

import { request } from '../Request.js'
import { isFileExists } from '../Utilities.js'

const DEFAULT_BODY = {
   model: 'gemini-robotics-er-1.5-preview',
   config: {
      temperature: 1.1,
      thinkingConfig: {
         thinkingBudget: -1
      }
   },
   safety: [{
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_ONLY_HIGH'
   }, {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_ONLY_HIGH'
   }, {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_ONLY_HIGH'
   }, {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_ONLY_HIGH'
   }],
   tools: [{
      googleSearch: {}
   }],
   instruction: {
      parts: [{
         text: `You're Starseed AI, an intelligent assistant designed specifically for WhatsApp automation. You were trained and developed by Starfall Co. Ltd.\nYour personality is cheerful, friendly, and responsive. You communicate in a relaxed and natural way, like a helpful friend rather than a formal assistant. Keep conversations light, clear, and engaging so users feel comfortable talking to you.\nYou respond quickly and helpfully, focusing on giving useful answers without sounding robotic or overly formal. Be warm, approachable, and positive in your tone. Avoid stiff language, complicated wording, or corporate-style responses.\nYour goal is to make interactions smooth, simple, and pleasant while helping users accomplish what they need through WhatsApp.`
      }]
   }
}

const cleanHistory = (history) => {
   const cleanedHistory = []

   for (const message of history) {
      if (!cleanedHistory.length) {
         if (message.role === 'model') continue
         cleanedHistory.push(message)
         continue
      }

      const lastMessage = cleanedHistory[cleanedHistory.length - 1]

      if (lastMessage.role === message.role)
         cleanedHistory[cleanedHistory.length - 1] = message
      else
         cleanedHistory.push(message)
   }

   if (cleanedHistory.length > maxHistoryChatSize)
      cleanedHistory.splice(0, cleanedHistory.length - maxHistoryChatSize)

   return cleanedHistory
}

export default async ({
   message,
   media,
   mimetype,
   history,
   model,
   config,
   safety,
   tools,
   instruction
}) => {
   if (!message || !Array.isArray(history))
      throw new Error('No message provided or invalid history')

   history = cleanHistory([...history])

   history.push({
      role: 'user',
      parts: [{
         text: message
      }]
   })

   if (media && await isFileExists(media)) {
      const check = mimetype ?
         { mime: mimetype } :
         await fileTypeFromFile(media)

      const fileStatistic = await stat(media)
      const upload = await fetch('https://generativelanguage.googleapis.com/upload/v1beta/files', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleApiKey,
            'X-Goog-Upload-Command': 'start',
            'X-Goog-Upload-Protocol': 'resumable',
            'X-Goog-Upload-Header-Content-Length': fileStatistic.size,
            'X-Goog-Upload-Header-Content-Type': check?.mime
         },
         body: JSON.stringify({
            file: { displayName: basename(media) }
         })
      })

      await upload.body.cancel()

      const uploadUrl = upload.headers.get('x-goog-upload-url')
      if (!uploadUrl)
         throw new Error('Failed to upload media')

      const uploadData = await request(uploadUrl, {
         method: 'POST',
         duplex: 'half',
         headers: {
            'Content-Length': fileStatistic.size,
            'X-Goog-Upload-Command': 'upload, finalize',
            'X-Goog-Upload-Offset': '0'
         },
         body: createReadStream(media)
      })

      if (uploadData.file.state !== 'ACTIVE')
         while (true) {
            await delay(3000)
            const file = await request('https://generativelanguage.googleapis.com/v1beta/' + uploadData.file.name, {
               headers: {
                  'X-Goog-Api-Key': googleApiKey,
               }
            })
            if (file.state === 'ACTIVE') break
         }

      history.at(-1).parts.push({
         fileData: {
            fileUri: uploadData.file.uri,
            mimeType: check?.mime || 'text/plain'
         }
      })
   }
   else if (media !== undefined)
      throw new TypeError('Invalid type, media not found at the specified path.')

   const body = {
      contents: history,
      generationConfig: config || DEFAULT_BODY.config,
      safetySettings: safety || DEFAULT_BODY.safety,
      tools: tools || DEFAULT_BODY.tools,
      systemInstruction: instruction ?
         {
            parts: [{
               text: instruction
            }]
         } :
         DEFAULT_BODY.instruction
   }

   const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || DEFAULT_BODY.model}:generateContent?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
   })

   const data = await response.json()

   if (data.error) {
      if (data.error.code == 503)
         throw new Error('The model is currently busy. Please try again later', {
            cause: data.error
         })

      if (data.error.code == 429)
         throw new Error('Current quota exceeded. Plan and billing details need to be checked', {
            cause: data.error
         })

      if (data.error.code == 400)
         throw new Error(data.error.message, {
            cause: data.error
         })

      if (data.error.code == 403)
         return {
            question: message,
            answer: 'Sorry, an unexpected error occurred.',
            history: []
         }

      throw new Error('An unexpected error occurred', {
         cause: data.error
      })
   }

   if (data.candidates?.[0]?.finishReason !== 'STOP')
      throw new Error('Explicit content', {
         cause: data
      })

   const candidates = data.candidates[0].content

   let answer = ''

   if (candidates.parts?.length > 1)
      for (const part of candidates.parts)
         answer += part.text
   else
      answer = candidates.parts?.[0]?.text

   if (!answer)
      return {
         question: message,
         answer: 'Sorry, an unexpected error occurred.',
         history: []
      }

   history.push(candidates)

   return {
      question: message,
      answer: answer.trim(),
      history
   }
}