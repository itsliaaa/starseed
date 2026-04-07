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

import { DONATE_URL } from '@itsliaaa/baileys'

import { CATEGORY_DESCRIPTIONS, CATEGORY_EMOJIS, FAKE_QUOTE, POPULAR_CATEGORIES } from '../lib/Constants.js'
import { fetchThumbnail, frame, greeting, resizeImage, toArray, toTitleCase } from '../lib/Utilities.js'
import { CommandIndex, ModuleCache } from '../lib/Watcher.js'

const OFFER_EXPIRATION = Date.now() * 2

const HIGHLIGHT_LABEL = { highlight_label: 'Most Used' }

let CACHED_REGISTRY = null,
   LAST_REGISTRY_SIZE = 0

const getCommandRegistry = () => {
   const commandIndexSize = CommandIndex.size
   if (CACHED_REGISTRY && LAST_REGISTRY_SIZE === commandIndexSize)
      return CACHED_REGISTRY

   const commandsSet = new Set()
   const categoriesSet = new Set()
   const grouped = {}

   for (const modules of ModuleCache.values()) {
      const { command: cachedCommand, category } = modules

      if (cachedCommand)
         for (const cmd of toArray(cachedCommand))
            commandsSet.add(cmd)

      if (category) {
         categoriesSet.add(category)
         grouped[category] ??= []
         grouped[category].push(...toArray(cachedCommand))
      }
   }

   const commands = [...commandsSet].sort()
   const categories = [...categoriesSet].sort()

   for (const key in grouped)
      grouped[key].sort()

   CACHED_REGISTRY = { commands, categories, grouped }
   LAST_REGISTRY_SIZE = commandIndexSize

   return CACHED_REGISTRY
}

export default {
   command: ['menu', 'command', 'help', 'allmenu'],
   async run(m, {
      sock,
      user,
      setting,
      isPrefix,
      command,
      text
   }) {
      try {
         const { commands, categories, grouped } = getCommandRegistry()
         let message = setting.menuMessage
            .replace('+tag', '@' + m.sender.split('@')[0])
            .replace('+name', m.pushName)
            .replace('+greeting', greeting()) +
            '\n\n'
         if (command === 'allmenu') {
            message += String.fromCharCode(8206).repeat(1000)
            for (const category in grouped) {
               message += frame(category.toUpperCase(), grouped[category].map(cmd => isPrefix + cmd), CATEGORY_EMOJIS[category] ?? '📁') +
                  '\n\n'
            }
            return m.reply(message.trim(), {
               externalAdReply: {
                  title: botName,
                  body: greeting(),
                  thumbnail: await fetchThumbnail(),
                  largeThumbnail: true
               }
            })
         }
         else if (categories.includes(text)) {
            const print = frame(text.toUpperCase(), grouped[text].map(cmd => isPrefix + cmd), CATEGORY_EMOJIS[text] ?? '📁')
            return m.reply(print.trim())
         }
         else if (setting.menuStyle == 1) {
            message += frame('CATEGORIES', categories.map(cmd => isPrefix + command + ' ' + cmd), '📋')
            m.reply(message.trim(), {
               externalAdReply: {
                  title: botName,
                  body: greeting(),
                  thumbnail: await fetchThumbnail(),
                  largeThumbnail: true
               }
            })
         }
         else if (setting.menuStyle == 2)
            sock.sendMessage(m.chat, {
               image: {
                  url: botThumbnail
               },
               caption: message.trim(),
               footer,
               nativeFlow: [{
                  text: '📚 List Menu',
                  sections: categories.map(category => ({
                     ...(POPULAR_CATEGORIES[category] ? HIGHLIGHT_LABEL : {}),
                     rows: [{
                        title: (CATEGORY_EMOJIS[category] ?? '📁') + ' ' + toTitleCase(category),
                        description: `📦 There are ${grouped[category].length} commands`,
                        id: `${isPrefix + command} ${category}`
                     }]
                  }))
               }]
            }, {
               quoted: m
            })
         else if (setting.menuStyle == 3)
            sock.sendMessage(m.chat, {
               image: {
                  url: botThumbnail
               },
               caption: message.trim(),
               footer,
               offerText: botName,
               offerUrl: DONATE_URL,
               offerExpiration: OFFER_EXPIRATION,
               optionText: '✴️ Tap Here',
               optionTitle: '📋 Select Options',
               nativeFlow: [{
                  text: '📚 List Menu',
                  sections: categories.map(category => ({
                     ...(POPULAR_CATEGORIES[category] ? HIGHLIGHT_LABEL : {}),
                     rows: [{
                        title: (CATEGORY_EMOJIS[category] ?? '📁') + ' ' + toTitleCase(category),
                        description: `📦 There are ${grouped[category].length} commands`,
                        id: `${isPrefix + command} ${category}`
                     }]
                  }))
               }, {
                  text: '📃 All Menu',
                  id: `${isPrefix}allmenu`
               }, {
                  text: '📊 Statistic',
                  id: `${isPrefix}statistic`
               }, {
                  text: '💰 Donate',
                  url: DONATE_URL
               }]
            }, {
               quoted: m
            })
         else if (setting.menuStyle == 4)
            sock.sendMessage(m.chat, {
               image: {
                  url: botThumbnail
               },
               product: {
                  title: botName
               },
               businessOwnerJid: m.sender,
               caption: message.trim(),
               footer,
               nativeFlow: [{
                  text: '📚 List Menu',
                  sections: categories.map(category => ({
                     ...(POPULAR_CATEGORIES[category] ? HIGHLIGHT_LABEL : {}),
                     rows: [{
                        title: (CATEGORY_EMOJIS[category] ?? '📁') + ' ' + toTitleCase(category),
                        description: `📦 There are ${grouped[category].length} commands`,
                        id: `${isPrefix + command} ${category}`
                     }]
                  }))
               }, {
                  text: '📃 All Menu',
                  id: `${isPrefix}allmenu`
               }, {
                  text: '💰 Donate',
                  url: DONATE_URL
               }]
            }, {
               quoted: m
            })
         else if (setting.menuStyle == 5)
            sock.sendMessage(m.chat, {
               image: {
                  url: botThumbnail
               },
               product: {
                  title: botName
               },
               businessOwnerJid: m.sender,
               caption: message.trim(),
               footer,
               optionText: '✴️ Tap Here',
               optionTitle: '📋 Select Options',
               nativeFlow: [{
                  text: '📚 List Menu',
                  sections: categories.map(category => ({
                     ...(POPULAR_CATEGORIES[category] ? HIGHLIGHT_LABEL : {}),
                     rows: [{
                        title: (CATEGORY_EMOJIS[category] ?? '📁') + ' ' + toTitleCase(category),
                        description: `📦 There are ${grouped[category].length} commands`,
                        id: `${isPrefix + command} ${category}`
                     }]
                  }))
               }, {
                  text: '📃 All Menu',
                  id: `${isPrefix}allmenu`
               }, {
                  text: '📊 Statistic',
                  id: `${isPrefix}statistic`
               }, {
                  text: '💰 Donate',
                  url: DONATE_URL
               }]
            }, {
               quoted: m
            })
         else if (setting.menuStyle == 6) {
            const profilePicture = await sock.profilePicture(m.sender)
            sock.sendMessage(m.chat, {
               document: {
                  url: profilePicture
               },
               jpegThumbnail: await resizeImage(profilePicture, 200),
               fileName: '👋🏻 ' + m.pushName,
               mimetype: 'image/jpeg',
               caption: message.trim(),
               footer,
               optionText: '📚 List Menu',
               optionTitle: '📋 Select Menu',
               nativeFlow: categories.map(category => ({
                  text: (CATEGORY_EMOJIS[category] ?? '📁') + ' ' + toTitleCase(category),
                  id: `${isPrefix + command} ${category}`
               })),
               externalAdReply: {
                  title: botName,
                  body: greeting(),
                  thumbnail: await fetchThumbnail(),
                  largeThumbnail: true
               }
            }, {
               quoted: m
            })
         }
         else if (setting.menuStyle == 7) {
            const profilePicture = await sock.profilePicture(m.sender)
            sock.sendMessage(m.chat, {
               document: {
                  url: profilePicture
               },
               jpegThumbnail: await resizeImage(profilePicture, 200),
               fileName: '👋🏻 ' + m.pushName,
               mimetype: 'image/jpeg',
               caption: message.trim(),
               footer,
               buttons: [{
                  text: '📚 List Menu',
                  sections: categories.map(category => ({
                     ...(POPULAR_CATEGORIES[category] ? HIGHLIGHT_LABEL : {}),
                     rows: [{
                        title: (CATEGORY_EMOJIS[category] ?? '📁') + ' ' + toTitleCase(category),
                        description: `📦 There are ${grouped[category].length} commands`,
                        id: `${isPrefix + command} ${category}`
                     }]
                  }))
               }, {
                  text: '📃 All Menu',
                  id: `${isPrefix}allmenu`
               }, {
                  text: '📊 Statistic',
                  id: `${isPrefix}statistic`
               }],
               externalAdReply: {
                  title: botName,
                  body: greeting(),
                  thumbnail: await fetchThumbnail(),
                  largeThumbnail: true
               }
            }, {
               quoted: m
            })
         }
         else if (setting.menuStyle == 8)
            sock.sendMessage(m.chat, {
               text: message.trim(),
               footer,
               cards: categories.map(category => ({
                  image: {
                     url: botThumbnail 
                  },
                  caption: frame(category.toUpperCase(), [CATEGORY_DESCRIPTIONS[category]], CATEGORY_EMOJIS[category] ?? '📁'),
                  footer: `📦 There are ${grouped[category].length} commands`,
                  offerText: botName,
                  offerUrl: DONATE_URL,
                  offerExpiration: OFFER_EXPIRATION,
                  nativeFlow: [{
                     text: (CATEGORY_EMOJIS[category] ?? '📁') + ' ' + toTitleCase(category),
                     id: `${isPrefix + command} ${category}`
                  }]
               }))
            }, {
               quoted: m
            })
         if (setting.menuMusic)
            sock.sendMedia(m.chat, botMenuMusic, '', FAKE_QUOTE, {
               ptt: true
            })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   }
}