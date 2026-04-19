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

import { downloadContentFromMessage, getContentType, normalizeMessageContent } from '@itsliaaa/baileys'

import { EMPTY_PARSED, G_US, LID, ME, MINUTE, S_WHATSAPP_NET, STATUS_BROADCAST } from './Constants.js'
import { greeting } from './Utilities.js'

export const downloadAsBuffer = async (m, type) => {
   if (!m || !(m.url || m.directPath)) return Buffer.alloc(0)

   try {
      const stream = await downloadContentFromMessage(m, type)

      const chunks = []
      for await (const chunk of stream)
         chunks.push(chunk)

      return Buffer.concat(chunks)
   }
   catch {
      return Buffer.alloc(0)
   }
}

export const extractMessageBody = (msg) => {
   if (!msg) return ''

   if (typeof msg === 'string') return msg

   const directText =
      msg.text ||
      msg.caption ||
      msg.name ||
      msg.selectedId ||
      msg.selectedButtonId ||
      msg.contentText ||
      msg.body?.text ||
      msg.singleSelectReply?.selectedRowId

   const nativeFlowResponseParams = msg.nativeFlowResponseMessage?.paramsJson

   if (nativeFlowResponseParams) {
      try {
         const parsedParams = JSON.parse(nativeFlowResponseParams)
         return parsedParams.id || ''
      }
      catch {
         return ''
      }
   }

   if (directText) return directText

   return ''
}

export const extractNumber = (msg) => {
   if (msg.quoted)
      return msg.quoted.sender
   if (msg.mentionedJid.length > 0)
      return msg.mentionedJid[0]
   if (msg.args.length > 0)
      return msg.args[0] + S_WHATSAPP_NET
}

export const findChatId = (key) => {
   if (key.remoteJid === STATUS_BROADCAST)
      return key.remoteJid

   const remoteJid = key.remoteJidAlt || key.remoteJid
   if (remoteJid.endsWith(LID))
      return key.senderPn || key.participantPn || key.participant

   return remoteJid
}

export const findUserJid = (sock, key) => {
   if (key.fromMe)
      return sock.user.decodedId

   const sender = key.remoteJidAlt || key.participantAlt
   if (!sender || sender.endsWith(LID))
      return key.participant || key.remoteJid

   return sender
}

export const findUserLid = (sock, key) => {
   if (key.fromMe)
      return sock.user.decodedLid

   const sender = key.participant || key.remoteJid
   if (!sender || sender.endsWith(S_WHATSAPP_NET))
      return key.participantAlt || key.remoteJidAlt

   return sender
}

export const normalizeMentionedJid = (store, mentionedJid) => {
   if (!mentionedJid)
      return []

   const mentionedSize = mentionedJid.length
   if (!mentionedSize)
      return mentionedJid

   let result = null

   for (let i = 0; i < mentionedSize; i++) {
      const userId = mentionedJid[i]
      const cached = store.contacts.get(userId)
      const userJid = cached && cached.jid

      const normalized = typeof userJid === 'string' && userJid.endsWith(S_WHATSAPP_NET) ? userJid : userId

      if (result)
         result[i] = normalized
      else if (normalized !== userId) {
         result = mentionedJid.slice()
         result[i] = normalized
      }
   }

   return result || mentionedJid
}

export const parseCommand = (body, setting) => {
   if (!body) return EMPTY_PARSED

   body = body.trim()
   if (!body) return EMPTY_PARSED

   let first = body[Symbol.iterator]().next().value
   if (!first) return EMPTY_PARSED

   if (
      first === '\u200D' ||
      first === '\uFE0F' ||
      first.trim() === ''
   ) return EMPTY_PARSED

   const isHasPrefix = setting.prefixes.includes(first)
   if (!isHasPrefix && setting.noPrefix) {
      const spaceIndex = body.indexOf(' ')

      if (spaceIndex === -1)
         return {
            prefix: '',
            command: body.toLowerCase(),
            text: '',
            args: [],
            isHasPrefix
         }

      const command = body.slice(0, spaceIndex).toLowerCase()
      const text = body.slice(spaceIndex + 1)

      const args = text.split(' ')
      return {
         prefix: '',
         command, text, args,
         isHasPrefix
      }
   }

   const rest = body.slice(first.length).trim()
   if (!rest) return EMPTY_PARSED

   const spaceIndex = rest.indexOf(' ')

   if (spaceIndex === -1)
      return {
         prefix: first,
         command: rest.toLowerCase(),
         text: '',
         args: [],
         isHasPrefix
      }

   const command = rest.slice(0, spaceIndex).toLowerCase()
   const text = rest.slice(spaceIndex + 1)

   const args = []
   let start = 0
   for (let i = 0; i <= text.length; i++)
      if (i === text.length || text[i] === ' ') {
         if (i > start)
            args.push(
               text.slice(start, i)
            )
         start = i + 1
      }

   return {
      prefix: first,
      command, text, args,
      isHasPrefix
   }
}

export const shouldUpdatePresence = (message) => 
   !(
      message.encEventResponseMessage ||
      message.encReactionMessage ||
      message.pollUpdateMessage ||
      message.protocolMessage ||
      message.reactionMessage
   )

function download() {
   const messageType = this.type

   const cleanType = messageType.slice(-7) === 'Message' ?
      messageType.slice(0, -7) :
      messageType

   return downloadAsBuffer(this.msg, cleanType)
}

function downloadQuoted() {
   const messageType = this.type

   const cleanType = messageType.slice(-7) === 'Message' ?
      messageType.slice(0, -7) :
      messageType

   return downloadAsBuffer(this, cleanType)
}

export const Serialize = (sock, store, setting, message) => {
   const m = {
      key: message.key,
      message: message.message,
      id: message.key.id,
      chat: findChatId(message.key),
      sender: '',
      senderLid: '',
      fromMe: message.key.fromMe,
      isMe: false,
      isGroup: false,
      isPrivate: false,
      isStatus: false,
      msg: {},
      type: '',
      body: '',
      prefix: '',
      command: '',
      text: '',
      args: [],
      isHasPrefix: false,
      pushName: '',
      mentionedJid: [],
      expiration: 0,
      quoted: null,
      reply: null,
      react: null,
      download: null
   }

   const sender = findUserJid(sock, message.key)
   const senderLid = findUserLid(sock, message.key)

   const cachedSenderId = store.contacts.get(sender || senderLid)

   m.sender = cachedSenderId?.jid || sender
   m.senderLid = cachedSenderId?.lid || senderLid

   const isCacheableUserId =
      !cachedSenderId &&
      m.sender?.endsWith(S_WHATSAPP_NET) &&
      m.senderLid?.endsWith(LID)
   if (isCacheableUserId) {
      store.contacts.set(m.sender, {
         jid: m.sender,
         lid: m.senderLid
      })

      store.contacts.set(m.senderLid, {
         jid: m.sender,
         lid: m.senderLid
      })
   }

   m.isMe = m.fromMe && m.id.includes(ME)
   m.isGroup = m.chat.endsWith(G_US)
   m.isPrivate = m.chat.endsWith(S_WHATSAPP_NET)
   m.isStatus = m.chat === STATUS_BROADCAST

   let innerMessage = normalizeMessageContent(message.message)
   const editedMessage = innerMessage?.protocolMessage?.editedMessage

   if (editedMessage)
      innerMessage = normalizeMessageContent(editedMessage)

   const messageType = getContentType(innerMessage)

   const msg = innerMessage[messageType]

   if (typeof msg === 'string')
      m.msg = { text: msg }
   else
      m.msg = msg

   m.type = messageType
   m.body = extractMessageBody(m.msg)

   const parsedBody = parseCommand(m.body, setting)
   m.prefix = parsedBody.prefix
   m.command = parsedBody.command
   m.text = parsedBody.text
   m.args = parsedBody.args
   m.isHasPrefix = parsedBody.isHasPrefix

   m.pushName = message.verifiedBizName || message.pushName || 'Somebody'

   const contextInfo = m.msg?.contextInfo || {}

   m.mentionedJid = normalizeMentionedJid(store, contextInfo?.mentionedJid)
   m.expiration = contextInfo?.expiration || 0
   m.quoted = contextInfo?.quotedMessage

   if (m.quoted) {
      const innerQuotedMessage = normalizeMessageContent(m.quoted)
      const quotedMessageType = getContentType(innerQuotedMessage)

      m.quoted = innerQuotedMessage[quotedMessageType]
      m.quoted = typeof m.quoted === 'string' ?
         { text: m.quoted } :
         m.quoted
      if (typeof m.quoted === 'object') {
         const quoted = m.quoted
         const quotedContextInfo = quoted?.contextInfo

         quoted.type = quotedMessageType
         quoted.body = extractMessageBody(quoted)

         const parsedQuotedBody = parseCommand(quoted.body, setting)
         quoted.text = parsedQuotedBody.text
         quoted.prefix = parsedQuotedBody.prefix
         quoted.command = parsedQuotedBody.command
         quoted.args = parsedQuotedBody.args
         quoted.isHasPrefix = parsedQuotedBody.isHasPrefix

         quoted.mentionedJid = normalizeMentionedJid(store, quotedContextInfo?.mentionedJid)
         quoted.expiration = quotedContextInfo?.expiration || m.expiration
         quoted.id = contextInfo.stanzaId
         quoted.chat = contextInfo.remoteJid || m.chat

         const quotedUserId = store.contacts.get(contextInfo.participant)

         quoted.sender = quotedUserId?.jid
         quoted.senderLid = quotedUserId?.lid

         quoted.fromMe = sock.user.decodedId === quoted.sender
         quoted.isMe = quoted.fromMe && quoted.id?.includes(ME)
         quoted.isGroup = quoted.chat.endsWith(G_US)
         quoted.isPrivate = quoted.chat.endsWith(S_WHATSAPP_NET)
         quoted.isStatus = quoted.chat === STATUS_BROADCAST
         quoted.key = {
            remoteJid: quoted.chat,
            fromMe: quoted.fromMe,
            id: quoted.id,
            participant: quoted.sender
         }

         quoted.download = null

         if (quoted.directPath)
            quoted.download = downloadQuoted
      }
   }

   m.reply = (text, options = {}, extra = {}) => {
      const replyStyle = setting.replyStyle

      let quote = m
      if (replyStyle == 2) {
         quote.key = {
            remoteJid: '0@s.whatsapp.net',
            fromMe: false,
            id: m.id,
            participant: m.sender
         }
         quote.message = {
            requestPaymentMessage: {
               amount1000: 70000000,
               currencyCodeIso4217: 'USD',
               requestFrom: '0@s.whatsapp.net',
               expiryTimestamp: 3551670489304,
               noteMessage: {
                  extendedTextMessage: {
                     text: `👤 ${m.pushName}`
                  }
               }
            }
         }
      }
      else if (replyStyle == 3) {
         const index = m.sender.indexOf('@')
         const userNumber = index !== -1 ? m.sender.slice(0, index) : m.sender
         quote.key = {
            remoteJid: STATUS_BROADCAST,
            fromMe: false,
            id: m.id,
            participant: m.sender
         }
         quote.message = {
            contactMessage: {
               displayName: '💬 ' + m.body,
               vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${m.pushName};;;\nFN:${m.pushName}\nTEL;type=CELL;type=VOICE;waid=${userNumber}:${userNumber}\nEND:VCARD`
            }
         }
      }

      return sock.sendText(m.chat, text, quote, options, extra)
   }

   m.react = (text = '💛', extra = {}) =>
      sock.sendMessage(m.chat, {
         react: {
            key: m.key,
            text
         }
      }, extra)

   if (m.msg?.directPath)
      m.download = download

   return m
}

export const StickerCommand = (m, savedHash = {}) => {
   if (m.type !== 'stickerMessage') return

   const base64Hash = m.msg.fileSha256.toString('base64')
   if (!(base64Hash in savedHash)) return

   const stickerCommand = savedHash[base64Hash]
   if (!stickerCommand) return

   m.body = stickerCommand.body
   m.prefix = stickerCommand.prefix
   m.command = stickerCommand.command
   m.text = stickerCommand.text
   m.args = stickerCommand.args
}