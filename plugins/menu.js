import { CATEGORY_DESCRIPTIONS, CATEGORY_EMOJIS } from '../lib/Constants.js'
import { downscaleImage, fetchThumbnail, frame, greeting, toArray, toTitleCase } from '../lib/Utilities.js'
import { ModuleCache } from '../lib/Watcher.js'

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
         const commandsSet = new Set()
         const categoriesSet = new Set()
         const grouped = Object.create(null)
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
         let message = '🌱 Hello ' +
            m.pushName + '\n\n' +
            'I\'m an automated WhatsApp system that helps you download media and find information directly through WhatsApp.' + '\n\n'
         if (command === 'allmenu') {
            message += String.fromCharCode(8206).repeat(1000)
            for (const category in grouped) {
               message += frame(category.toUpperCase(), grouped[category].map(cmd => isPrefix + cmd), CATEGORY_EMOJIS[category] ?? '📁') +
                  '\n\n'
            }
            m.reply(message.trim(), {
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
            m.reply(print.trim())
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
         else if (setting.menuStyle == 2) {
            sock.sendMessage(m.chat, {
               image: {
                  url: botThumbnail
               },
               caption: message.trim(),
               footer,
               nativeFlow: [{
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                     title: '📄 List Menu',
                     sections: [{
                        rows: categories.map(category => ({
                           title: (CATEGORY_EMOJIS[category] ?? '📁') + ' ' + toTitleCase(category),
                           description: `📦 There are ${grouped[category].length} commands`,
                           id: `${isPrefix + command} ${category}`
                        }))
                     }]
                  })
               }]
            }, {
               quoted: m
            })
         }
         else if (setting.menuStyle == 3) {
            sock.sendMessage(m.chat, {
               image: {
                  url: botThumbnail
               },
               caption: message.trim(),
               footer,
               couponText: botName,
               couponCode: greeting(),
               optionText: '✴️ Tap Here',
               optionTitle: '📋 Select Options',
               nativeFlow: [{
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                     title: '📄 List Menu',
                     sections: [{
                        rows: categories.map(category => ({
                           title: (CATEGORY_EMOJIS[category] ?? '📁') + ' ' + toTitleCase(category),
                           description: `📦 There are ${grouped[category].length} commands`,
                           id: `${isPrefix + command} ${category}`
                        }))
                     }]
                  })
               }, {
                  text: '📃 All Menu',
                  id: `${isPrefix}allmenu`
               }, {
                  text: '📊 Statistic',
                  id: `${isPrefix}statistic`
               }, {
                  text: '📥 Source Code',
                  id: `${isPrefix}script`
               }]
            }, {
               quoted: m
            })
         }
         else if (setting.menuStyle == 4) {
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
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                     title: '📄 List Menu',
                     sections: [{
                        rows: categories.map(category => ({
                           title: (CATEGORY_EMOJIS[category] ?? '📁') + ' ' + toTitleCase(category),
                           description: `📦 There are ${grouped[category].length} commands`,
                           id: `${isPrefix + command} ${category}`
                        }))
                     }]
                  })
               }, {
                  text: '📥 Source Code',
                  id: `${isPrefix}script`
               }]
            }, {
               quoted: m
            })
         }
         else if (setting.menuStyle == 5) {
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
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                     title: '📄 List Menu',
                     sections: [{
                        rows: categories.map(category => ({
                           title: (CATEGORY_EMOJIS[category] ?? '📁') + ' ' + toTitleCase(category),
                           description: `📦 There are ${grouped[category].length} commands`,
                           id: `${isPrefix + command} ${category}`
                        }))
                     }]
                  })
               }, {
                  text: '📃 All Menu',
                  id: `${isPrefix}allmenu`
               }, {
                  text: '📥 Source Code',
                  id: `${isPrefix}script`
               }]
            }, {
               quoted: m
            })
         }
         else if (setting.menuStyle == 6) {
            const profilePicture = await sock.profilePicture(m.sender)
            sock.sendMessage(m.chat, {
               document: {
                  url: profilePicture
               },
               jpegThumbnail: await downscaleImage(profilePicture, 252),
               fileName: '👋🏻 ' + greeting() + ' ' + m.pushName,
               mimetype: 'image/jpeg',
               caption: message.trim(),
               footer,
               optionText: '📄 List Menu',
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
            sock.sendMessage(m.chat, {
               text: message.trim(),
               footer,
               cards: categories.map(category => ({
                  image: {
                     url: botThumbnail 
                  },
                  caption: frame(category.toUpperCase(), [CATEGORY_DESCRIPTIONS[category]], CATEGORY_EMOJIS[category] ?? '📁'),
                  footer: `📦 There are ${grouped[category].length} commands`,
                  nativeFlow: [{
                     text: (CATEGORY_EMOJIS[category] ?? '📁') + ' ' + toTitleCase(category),
                     id: `${isPrefix + command} ${category}`
                  }]
               }))
            }, {
               quoted: m
            })
         }
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   }
}