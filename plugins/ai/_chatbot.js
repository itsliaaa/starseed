import { tokenizeCode } from '@itsliaaa/baileys'

import { FENCE_REGEX, TABLE_SEPARATOR_REGEX } from '../../lib/Constants.js'
import { persistToFile } from '../../lib/Utilities.js'

import Gemini from '../../lib/Components/Gemini.js'

const MAX_SIZE = 1024 * 1024 * 3

const QUOTED_MESSAGE = {
   true: '[User quoted your message]:',
   false: '[Quoted a user’s message]:'
}

export default {
   async run(m, {
      sock,
      user,
      setting,
      isPartner,
      body
   }) {
      if (
         !setting.chatBot ||
         !setting.botModel ||
         !setting.botInstruction ||
         !body ||
         m.fromMe ||
         !googleApiKey
      ) return
      try {
         const q = m.quoted ? m.quoted : m
         const mimetype = (q.msg || q).mimetype
         const mediaSize = (q.msg || q).fileLength?.low
         const instanceBody = (
            m.quoted ?
               `[Message from ${m.pushName}]:\n` +
               body +
               `\n${QUOTED_MESSAGE[m.quoted.fromMe]}` +
               m.quoted.text :
               `[Message from ${m.pushName}]:\n` +
               body
         )?.trim()
         const cleanBody = instanceBody
            .replace(`@${sock.user.decodedId?.split('@')[0]}`, '')
            .replace(`@${sock.user.decodedLid?.split('@')[0]}`, '')
            .trim()
         let isTag = false
         for (const userId of m.mentionedJid)
            if (userId === sock.user.decodedId || userId === sock.user.decodedLid) {
               isTag = true
               break
            }
         if (
            !isTag &&
            m.quoted &&
            m.quoted.type === 'conversation'
         )
            isTag = m.quoted.sender === sock.user.decodedId || m.quoted.sender === sock.user.decodedLid
         if ((m.isGroup && isTag) || m.isPrivate) {
            if (mediaSize && mediaSize > MAX_SIZE)
               return m.reply('❌ Maximum media size is 3MB.')
            const bufferMedia = await q.download?.()
            if (mimetype && !Buffer.isBuffer(bufferMedia))
               return m.reply('❌ Failed to download media.')
            const filePath = mimetype && await persistToFile(bufferMedia)
            if (!isPartner) {
               if (user.limit > 0)
                  user.limit -= 1
               else
                  return m.reply(`⚠️ Your limit is not enough to continue the chat, try \`${setting.prefixes[0]}claim\` command to claim limit.`)
            }
            const data = await Gemini({
               message: cleanBody,
               media: filePath,
               mimetype,
               history: user.historyChat,
               model: setting.botModel,
               instruction: setting.botInstruction
            })
            const binaryContent = parse(data.answer)
            sock.sendMessage(m.chat, {
               richResponse: binaryContent.map(node => {
                  switch (node.type) {
                     case 'text':
                        return { text: node.content }
                     case 'table':
                        return {
                           table: node.rows.map((row, index) => ({ isHeading: index == 0, items: row }))
                        }
                     case 'code':
                        return {
                           language: node.language,
                           code: tokenizeCode(node.content, node.language)
                        }
                  }
               })
            }, {
               quoted: m
            })
            user.historyChat = data.history
         }
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   }
}

const isTableSeparator = (line) =>
   TABLE_SEPARATOR_REGEX.test(line)

const isTableRow = (line) =>
   line.includes('|')

const parseRow = (line) =>
   line.split('|')
      .map(s => s.trim())
      .filter(Boolean)

const parse = (input) => {
   const lines = input.split('\n')
   const binaryContent = []

   let inCode = false,
      codeLanguage = 'text',
      codeBuffer = []
   let inTable = false,
      tableRows = []
   let textBuffer = []

   const flushText = () => {
      if (textBuffer.length > 0) {
         const joinedText = textBuffer.join('\n').trim()
         if (joinedText)
            binaryContent.push({ type: 'text', content: joinedText })
         textBuffer = []
      }
   }

   for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const fenceMatch = line.match(FENCE_REGEX)

      if (fenceMatch) {
         if (!inCode) {
            flushText()
            inCode = true
            codeLanguage = fenceMatch[1] || 'text'
            codeBuffer = []
         }
         else {
            binaryContent.push({
               type: 'code',
               language: codeLanguage,
               content: codeBuffer.join('\n') + '\n'
            })
            inCode = false
         }
         continue
      }

      if (inCode) {
         codeBuffer.push(line)
         continue
      }

      if (!inTable && isTableRow(line) && isTableSeparator(lines[i + 1] || '')) {
         flushText()
         inTable = true
         tableRows = [parseRow(line)]
         i++
         continue
      }

      if (inTable) {
         if (isTableRow(line)) {
            tableRows.push(parseRow(line))
            continue
         }
         else {
            binaryContent.push({ type: 'table', rows: tableRows })
            inTable = false
         }
      }

      textBuffer.push(line)
   }

   if (inTable)
      binaryContent.push({ type: 'table', rows: tableRows })
   flushText()

   return binaryContent
}