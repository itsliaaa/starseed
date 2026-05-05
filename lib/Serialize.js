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

import { DAY, EMPTY_PARSED, G_US, LID, ME, MINUTE, S_WHATSAPP_NET, STATUS_BROADCAST } from './Constants.js'
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

export const extractNumber = (m) => {
   if (m.quoted)
      return m.quoted.sender
   if (m.mentionedJid.length > 0)
      return m.mentionedJid[0]
   if (m.args.length > 0)
      return m.args[0] + S_WHATSAPP_NET
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

   return downloadAsBuffer(this.msg, cleanType)
}

export const Serialize = (sock, store, setting, message) => {
   const msgKey = message.key || {}
   const msgId = msgKey.id || ''
   const msgChat = findChatId(msgKey) || ''
   const msgFromMe = Boolean(msgKey.fromMe)

   const rawSender = findUserJid(sock, msgKey) || ''
   const rawSenderLid = findUserLid(sock, msgKey) || ''

   let sender = rawSender
   let senderLid = rawSenderLid
   
   const cachedSender = store.contacts.get(rawSender || rawSenderLid)

   if (cachedSender) {
      sender = cachedSender.jid || rawSender
      senderLid = cachedSender.lid || rawSenderLid
   }
   else if (rawSender.endsWith(S_WHATSAPP_NET) && rawSenderLid.endsWith(LID)) {
      const cacheData = { jid: sender, lid: senderLid }
      store.contacts.set(sender, cacheData)
      store.contacts.set(senderLid, cacheData)
   }

   const isMe = msgFromMe && msgId.includes(ME)
   const isGroup = msgChat.endsWith(G_US)
   const isPrivate = msgChat.endsWith(S_WHATSAPP_NET)
   const isStatus = msgChat === STATUS_BROADCAST

   let innerMessage = normalizeMessageContent(message.message)
   if (innerMessage && innerMessage.protocolMessage && innerMessage.protocolMessage.editedMessage)
      innerMessage = normalizeMessageContent(innerMessage.protocolMessage.editedMessage)

   const messageType = getContentType(innerMessage) || ''
   let msg = (innerMessage && innerMessage[messageType]) || {}

   if (typeof msg === 'string')
      msg = { text: msg }

   const body = extractMessageBody(msg) || ''
   const parsedBody = parseCommand(body, setting)
   const pushName = message.verifiedBizName || message.pushName || 'Somebody'

   const contextInfo = msg.contextInfo || null
   const rawQuoted = (contextInfo && contextInfo.quotedMessage) || null
   const expiration = (contextInfo && contextInfo.expiration) || 0
   const mentionedJid = normalizeMentionedJid(store, (contextInfo && contextInfo.mentionedJid) || null)

   let quoted = null
   if (rawQuoted) {
      const innerQuotedMessage = normalizeMessageContent(rawQuoted)
      const quotedMessageType = getContentType(innerQuotedMessage) || ''
      let quotedMsg = (innerQuotedMessage && innerQuotedMessage[quotedMessageType]) || {}

      if (typeof quotedMsg === 'string')
         quotedMsg = { text: quotedMsg }

      if (typeof quotedMsg === 'object') {
         const quotedContextInfo = quotedMsg.contextInfo || null
         const quotedBody = extractMessageBody(quotedMsg) || ''
         const parsedQuotedBody = parseCommand(quotedBody, setting)

         const qStanzaId = (contextInfo && contextInfo.stanzaId) || ''
         const qChat = (contextInfo && contextInfo.remoteJid) || msgChat
         const qParticipant = (contextInfo && contextInfo.participant) || ''

         const quotedUserId = store.contacts.get(qParticipant)
         const qSender = (quotedUserId && quotedUserId.jid) || ''
         const qSenderLid = (quotedUserId && quotedUserId.lid) || ''

         const qFromMe = Boolean(sock.user && sock.user.decodedId === qSender)
         const qIsMe = qFromMe && qStanzaId.includes(ME)

         quoted = {
            key: {
               remoteJid: qChat,
               fromMe: qFromMe,
               id: qStanzaId,
               participant: qSender
            },
            message: rawQuoted,
            id: qStanzaId,
            chat: qChat,
            sender: qSender,
            senderLid: qSenderLid,
            fromMe: qFromMe,
            isMe: qIsMe,
            isGroup: qChat.endsWith(G_US),
            isPrivate: qChat.endsWith(S_WHATSAPP_NET),
            isStatus: qChat === STATUS_BROADCAST,
            msg: quotedMsg,
            type: quotedMessageType,
            body: quotedBody,
            prefix: parsedQuotedBody.prefix || '',
            command: parsedQuotedBody.command || '',
            text: parsedQuotedBody.text || '',
            args: parsedQuotedBody.args || [],
            isHasPrefix: Boolean(parsedQuotedBody.isHasPrefix),
            mentionedJid: normalizeMentionedJid(store, (quotedContextInfo && quotedContextInfo.mentionedJid) || null),
            expiration: (quotedContextInfo && quotedContextInfo.expiration) || expiration,
            download: quotedMsg.directPath ? downloadQuoted : null
         }
      }
   }

   const reply = async (text, options = {}, extra = {}) => {
      const replyStyle = setting.replyStyle

      const quote = message
      if (replyStyle == 2) {
         quote.key = {
            remoteJid: '0@s.whatsapp.net',
            fromMe: false,
            id: msgId,
            participant: sender
         }
         quote.message = {
            requestPaymentMessage: {
               amount1000: 70000000,
               currencyCodeIso4217: 'USD',
               requestFrom: '0@s.whatsapp.net',
               expiryTimestamp: 3551670489304,
               noteMessage: {
                  extendedTextMessage: {
                     text: `👤 ${pushName}`
                  }
               }
            }
         }
      }
      else if (replyStyle == 3) {
         const index = sender.indexOf('@')
         const userNumber = index !== -1 ? sender.slice(0, index) : sender
         const userName = pushName

         quote.key = {
            remoteJid: STATUS_BROADCAST,
            fromMe: false,
            id: msgId,
            participant: sender
         }
         quote.message = {
            contactMessage: {
               displayName: '👤 ' + userName,
               vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${userName};;;\nFN:${userName}\nTEL;type=CELL;type=VOICE;waid=${userNumber}:${userNumber}\nEND:VCARD`
            }
         }
      }

      return sock.sendText(msgChat, text, quote, options, extra)
   }

   const react = (text = '💛', extra = {}) =>
      sock.sendMessage(msgChat, {
         react: {
            key: msgKey,
            text
         }
      }, extra)

   const downloadFunc = msg.directPath ? download : null

   return {
      key: msgKey,
      message: message.message,
      id: msgId,
      chat: msgChat,
      sender: sender,
      senderLid: senderLid,
      fromMe: msgFromMe,
      isMe: isMe,
      isGroup: isGroup,
      isPrivate: isPrivate,
      isStatus: isStatus,
      msg: msg,
      type: messageType,
      body: body,
      prefix: parsedBody.prefix || '',
      command: parsedBody.command || '',
      text: parsedBody.text || '',
      args: parsedBody.args || [],
      isHasPrefix: Boolean(parsedBody.isHasPrefix),
      pushName: pushName,
      mentionedJid: mentionedJid,
      expiration: expiration,
      quoted: quoted,
      reply: reply,
      react: react,
      download: downloadFunc
   }
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