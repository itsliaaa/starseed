import { isJidNewsletter } from '@itsliaaa/baileys'
import { unzip, Zip, ZipDeflate } from 'fflate'
import { createWriteStream, createReadStream } from 'fs'
import { mkdir, readdir, readFile, rename, unlink, writeFile } from 'fs/promises'
import { basename, dirname, join, relative, resolve } from 'path'

import { AVAILABLE_MODELS } from '../../lib/Constants.js'
import { createFileName, isMimeAudio, isMimeImage, persistToFile, resizeImage, toArray } from '../../lib/Utilities.js'
import { ModuleCache } from '../../lib/Watcher.js'

const TOP_PATH = 'starseed-main/'

const HIGHLIGHT_LABEL = { highlight_label: 'Subscription Only' }

const MENU_STYLES = {
   1: '🌱 `Extended Text Message` with `externalAdReply`.',
   2: '👉🏻 `Interactive Message` with `single_select`.',
   3: '🏷️ `Interactive Message` with `bottom_sheet` and `limited_time_offer`.',
   4: '🛒 `Interactive Message` with `Product Header`.',
   5: '🛒 `Interactive Message` with `Product Header` and `bottom_sheet`.',
   6: '🛒 `Interactive Message` with `Document Header`, `bottom_sheet`, and `externalAdReply`.',
   7: '📍 `Interactive Message` with `Location Header`, `bottom_sheet`, and `externalAdReply`.',
   8: '🛒 `Buttons Message` with `Document Header` and `externalAdReply`.',
   9: '🖼️ `Interactive Message` with `Carousel Message`.'
}

const REPLY_STYLES = {
   1: '💭 Classic quote user message.',
   2: '💳 Quoted `requestPaymentMessage` with forward.',
   3: '👤 Quoted `contactMessage` with forward.'
}

const SETTING_MAPS = {
   gconly: 'groupOnly',
   afknotifier: 'afkNotifier',
   autodownload: 'autoDownload',
   chatbot: 'chatBot',
   commandsuggestion: 'commandSuggestions',
   menumusic: 'menuMusic',
   noprefix: 'noPrefix',
   notifier: 'notifier',
   reactstatus: 'reactStatus',
   readmessage: 'readMessage',
   rejectcall: 'rejectCall',
   securelabel: 'secureLabel',
   slowmode: 'slowMode',
   typingpresence: 'typingPresence'
}

const PRETTY_SETTING_MAPS = {
   gconly: 'Group Only',
   afknotifier: 'AFK Notifier',
   autodownload: 'Auto Download',
   chatbot: 'Chat Bot',
   commandsuggestion: 'Command Suggestions',
   menumusic: 'Menu Music',
   noprefix: 'No Prefix',
   notifier: 'Notifier',
   reactstatus: 'React Status',
   readmessage: 'Read Message',
   rejectcall: 'Reject Call',
   securelabel: 'Secure Label',
   slowmode: 'Slow Mode',
   typingpresence: 'Typing Presence'
}

const ExcludeForWrap = new Set(['.git', '.github', '.gitignore', 'node_modules', 'package-lock.json', 'session', 'yarn.lock', databaseFilename, storeFilename, temporaryFolder])
const ExcludeForUnzip = new Set(['.git', '.github', '.gitignore', 'broadcast.jpg', 'mosque.jpg', 'profile.jpg', 'thumbnail.jpg'])
const EvaluateCharacters = new Set(['=>', '~>', '>', '$', '%'])

const writeAndDrain = (stream, chunk) =>
   new Promise((resolve, reject) => {
      const isOk = stream.write(chunk)
      if (isOk)
         return res()
      stream.once('drain', resolve)
      stream.once('error', reject)
   })

const unzipAsync = (data) =>
   new Promise((resolve, reject) => {
      unzip(data, (error, files) => {
         if (error)
            reject(error)
         else
            resolve(files)
      })
   })

const addDirectory = async (zip, directoryPath = process.cwd(), topPath = process.cwd()) => {
   const entries = await readdir(directoryPath, { withFileTypes: true })

   for (const entry of entries) {
      if (ExcludeForWrap.has(entry.name)) continue
      if (entry.name.startsWith('.')) continue
      if (entry.isSymbolicLink()) continue

      const fullPath = join(directoryPath, entry.name)
      const relPath = relative(topPath, fullPath)

      if (entry.isDirectory())
         await addDirectory(zip, fullPath, topPath)
      else if (entry.isFile())
         await addStream(zip, fullPath, relPath)
   }
}

const addStream = async (zip, fullPath, relPath, outputStream) => {
   const deflate = new ZipDeflate(relPath, { level: 6 })

   const origOndata = deflate.ondata
   deflate.ondata = async (error, data, final) => {
      if (error)
         throw error

      await writeAndDrain(outputStream, data)

      if (origOndata)
         origOndata(error, data, final)
   }

   zip.add(deflate)

   const stream = createReadStream(fullPath, { highWaterMark: 64 * 1024 })
   for await (const chunk of stream) {
      if (chunk instanceof Buffer)
         deflate.push(chunk)
      else
         deflate.push(Buffer.from(chunk))

      await new Promise(r => setImmediate(r))
   }

   deflate.push(new Uint8Array(0), true)
}

const wrapScript = () => {
   const filePath = join(temporaryFolder, `Starseed-${createFileName()}.zip`)
   const output = createWriteStream(filePath)

   return new Promise((resolve, reject) => {
      const zip = new Zip((error, chunk, final) => {
         if (error)
            return reject(error)
         output.write(chunk)
         if (final) {
            output.end()
            resolve(filePath)
         }
      })

      addDirectory(zip)
         .then(() => zip.end())
         .catch(reject)
   })
}

const updateScript = async () => {
   const zipPath = await persistToFile('https://github.com/itsliaaa/starseed/archive/refs/heads/main.zip')

   const files = await unzipAsync(
      new Uint8Array(await readFile(zipPath))
   )

   for (const fileName in files) {
      if (!fileName.startsWith(TOP_PATH)) continue
      if (fileName.endsWith('/')) continue

      const relative = fileName.slice(14)
      if (!relative || ExcludeForUnzip.has(relative)) continue

      const destination = join(process.cwd(), relative)

      await mkdir(dirname(destination), { recursive: true })
      await writeFile(destination, files[fileName])
   }

   await unlink(zipPath)
}

const atomicWrite = (db, store) =>
   Promise.all([
      db.writeToFile(),
      store.writeToFile()
   ])

export default {
   command: ['afknotifier', 'autodownload', 'backup', 'backupsc', 'chatbot', 'commandsuggestion', 'disable', 'enable', 'gconly', 'menumusic', 'noprefix', 'notifier', 'public', 'reactstatus', 'readmessage', 'rejectcall', 'resetlimit', 'restart', 'restore', 'securelabel', 'setbroadcastcd', 'setinstruction', 'setmenu', 'setmenumusic', 'setmenumessage', 'setmodel', 'setname', 'setbio', 'setpp', 'setcover', 'setchid', 'setreply', 'slowmode', 'self', 'typingpresence', 'updatesc', '+prefix', '-prefix'],
   category: 'owner',
   async run (m, {
      sock,
      db,
      store,
      setting,
      isPrefix,
      command,
      args,
      text
   }) {
      if (
         command === 'afknotifier' ||
         command === 'autodownload' ||
         command === 'chatbot' ||
         command === 'commandsuggestion' ||
         command === 'menumusic' ||
         command === 'gconly' ||
         command === 'noprefix' ||
         command === 'notifier' ||
         command === 'reactstatus' ||
         command === 'readmessage' ||
         command === 'rejectcall' ||
         command === 'securelabel' ||
         command === 'slowmode' ||
         command === 'typingpresence'
      ) {
         const [option] = args
         if (!option)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} on`)
         if (option !== 'on' && option !== 'off')
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} on`)
         if (command === 'chatbot' && (!googleApiKey || !setting.botModel))
            return m.reply(`❌ Chat Bot feature is currently unavailable. Please set \`googleApiKey\` in \`config.js\` and choose a model using the \`${isPrefix}setmodel\` command first.`)
         const isActivating = option === 'on'
         const keySetting = SETTING_MAPS[command] || command
         const prettyKeyName = PRETTY_SETTING_MAPS[command]
         let print = isActivating ?
            `❌ ${prettyKeyName} already activated.` :
            `❌ ${prettyKeyName} already deactivated.`
         if (setting[keySetting] === isActivating)
            return m.reply(print)
         setting[keySetting] = isActivating
         print = isActivating ?
            `✅ Successfully activating ${prettyKeyName}.` :
            `✅ Successfully deactivating ${prettyKeyName}.`
         if (
            command === 'securelabel' ||
            command === 'slowmode' ||
            command === 'typingpresence'
         )
            print += '\n\n> ⚠️ Restart is required to apply the changes.'
         m.reply(print)
      }
      else if (command === 'backup') {
         m.react('🕒')
         await atomicWrite(db, store)
         sock.sendMedia(m.chat, resolve(databaseFilename), '✅ Backup completed.', m, {
            fileName: databaseFilename
         })
      }
      else if (command === 'backupsc') {
         m.react('🕒')
         const filePath = await wrapScript()
         sock.sendMedia(m.chat, filePath, '✅ Backup completed.', m, {
            document: true,
            fileName: basename(filePath)
         })
      }
      else if (command === 'disable') {
         const [cmd] = args
         if (!cmd)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} claim`)
         const commands = new Set()
         for (const modules of ModuleCache.values()) {
            const cachedCommand = modules.command
            if (cachedCommand)
               for (const cmds of toArray(cachedCommand))
                  commands.add(cmds)
         }
         if (!commands.has(cmd))
            return m.reply('❌ Command not found.')
         if (setting.disabledCommand.includes(cmd))
            return m.reply('💭 Command already disabled.')
         setting.disabledCommand.push(cmd)
         m.reply(`✅ Successfully disabling *"${cmd}"*.`)
      }
      else if (command === 'enable') {
         const [cmd] = args
         if (!cmd)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} claim`)
         if (!setting.disabledCommand.includes(cmd))
            return m.reply('💭 Command already enabled.')
         setting.disabledCommand.forEach((data, index) => {
            if (data === cmd)
               setting.disabledCommand.splice(index, 1)
         })
         m.reply(`✅ Successfully enabling *"${cmd}"*.`)
      }
      else if (command === 'resetlimit') {
         for (const user of db.users.values())
            user.limit = defaultLimit
         setting.lastReset = Date.now()
         await atomicWrite(db, store)
         m.reply('✅ Successfully reset limit for all user to default.')
      }
      else if (command === 'restart') {
         await m.reply('🔃 Restarting...')
         await atomicWrite(db, store)
         process.send('reset')
      }
      else if (command === 'restore') {
         const q = m.quoted ? m.quoted : m
         if (!q.type.startsWith('document') || !q.fileName.includes(databaseFilename))
            return m.reply('❌ Reply to the backup file first.')
         m.react('🕒')
         const filePath = await persistToFile(await q.download())
         await db.readFromFile(filePath)
         await atomicWrite(db, store)
         m.reply('✅ Database was successfully restored.')
      }
      else if (command === 'setbroadcastcd') {
         const value = Number(args[0])
         if (!Number.isFinite(value))
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} 10000`)
         if (value < 1000)
            return m.reply('❌ Cooldown is too short.')
         setting.broadcastCooldown = value
         m.reply(`✅ Successfully set broadcast cooldown to *${value}* ms.`)
      }
      else if (command === 'setinstruction') {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} You're Starseed AI, developed and maintained by Starfall Co. Ltd.`)
         setting.botInstruction = text
         m.reply(`✅ Successfully set bot instruction.`)
      }
      else if (command === 'setmenu') {
         if (!args.length)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} 1`)
         const selected = MENU_STYLES[args[0]]
         if (!selected)
            return m.reply('❌ Style not available.')
         setting.menuStyle = args[0]
         m.reply('✅ Successfully set menu style.' +
            '\n\n> ' + selected)
      }
      else if (command === 'setmenumusic') {
         const q = m.quoted?.url ? m.quoted : m
         const mimetype = (q.msg || q).mimetype
         if (!isMimeAudio(mimetype))
            return m.reply(`❌ Invalid media type, audio only.`)
         m.react('🕒')
         const buffer = await q.download()
         if (!Buffer.isBuffer(buffer))
            return m.reply('❌ Failed to download media.')
         const filePath = await persistToFile(buffer)
         await rename(filePath, botMenuMusic)
         m.reply('✅ Successfully set music.')
      }
      else if (command === 'setmenumessage') {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} Hello +tag (+name) +greeting 👋🏻`)
         setting.menuMessage = text
         m.reply('✅ Successfully set menu message.')
      }
      else if (command === 'setmodel') {
         if (!text.includes('--model'))
            return sock.sendMessage(m.chat, {
               text: 'Choose a model',
               footer,
               nativeFlow: [{
                  text: '📄 List Model',
                  sections: Object.entries(AVAILABLE_MODELS)
                     .map(([key, value]) => ({
                        ...(value.subscriptionOnly ? HIGHLIGHT_LABEL : {}),
                        rows: [{
                           title: key,
                           description: value.description,
                           id: `${isPrefix + command} --model ${key}`
                        }]
                     }))
               }]
            }, {
               quoted: m
            })
         if (!googleApiKey)
            return m.reply('❌ Google API key is missing. Please configure `googleApiKey` in `config.js` first.')
         const model = args[1]
         if (!(model in AVAILABLE_MODELS))
            return m.reply(`❌ Model "${model}" not found.`)
         setting.botModel = model
         m.reply('✅ Successfully set bot model.')
      }
      else if (command === 'setname') {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} Starseed`)
         if (text.length > 25)
            return m.reply('❌ Maximum 25 characters.')
         await sock.updateProfileName(text)
         m.reply('✅ Successfully change the profile name.')
      }
      else if (command === 'setbio') {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} WhatsApp Automation`)
         if (text.length > 50)
            return m.reply('❌ Maximum 50 characters.')
         await sock.updateProfileStatus(text)
         m.reply('✅ Successfully change the profile bio.')
      }
      else if (command === 'setpp') {
         const q = m.quoted?.url ? m.quoted : m
         const mimetype = (q.msg || q).mimetype
         if (!isMimeImage(mimetype))
            return m.reply('💭 Provide an image to change profile picture.')
         m.react('🕒')
         await sock.updateProfilePicture(sock.user.decodedId, await q.download())
         m.reply('✅ Successfully changed.')
      }
      else if (command === 'setcover') {
         const q = m.quoted?.url ? m.quoted : m
         const mimetype = (q.msg || q).mimetype
         if (!isMimeImage(mimetype))
            return m.reply(`❌ Invalid media type, image only.`)
         m.react('🕒')
         const buffer = await q.download()
         if (!Buffer.isBuffer(buffer))
            return m.reply('❌ Failed to download media.')
         const filePath = await persistToFile(
            await resizeImage(buffer, 720)
         )
         await rename(filePath, botThumbnail)
         m.reply('✅ Successfully set cover.')
      }
      else if (command === 'setchid') {
         if (!args.length)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} 12111111111111@newsletter`)
         if (!isJidNewsletter(args[0]))
            return m.reply('❌ Invalid newsletter id, you can get it your newsletter id with \`${isPrefix}channelid\` command.')
         setting.newsletterId = args[0]
         m.reply('✅ Successfully set newsletter id.')
      }
      else if (command === 'setreply') {
         if (!args.length)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} 1`)
         const selected = REPLY_STYLES[args[0]]
         if (!selected)
            return m.reply('❌ Style not available.')
         setting.replyStyle = args[0]
         m.reply('✅ Successfully set reply style.' +
            '\n\n> ' + selected)
      }
      else if (command === 'public') {
         if (!setting.self)
            return m.reply('❌ Already in public mode.')
         setting.self = false
         m.reply('✅ Successfully set to public mode.')
      }
      else if (command === 'self') {
         if (setting.self)
            return m.reply('❌ Already in self mode.')
         setting.self = true
         m.reply('✅ Successfully set to self mode.')
      }
      else if (command === 'updatesc') {
         m.react('🕒')
         await atomicWrite(db, store)
         await sock.sendMedia(m.chat, resolve(databaseFilename), '✅ *(1/3)* Backup database completed.', m, {
            fileName: databaseFilename
         })
         const filePath = await wrapScript()
         await sock.sendMedia(m.chat, filePath, '✅ *(2/3)* Backup script completed.', m, {
            document: true,
            fileName: basename(filePath)
         })
         try {
            await updateScript()
            await m.reply('✅ *(3/3)* Successfully updated, restarting...')
            process.send('reset')
         }
         catch (error) {
            console.error(error)
            m.reply('❌ Failed to update the script.')
         }
      }
      else if (command === '+prefix') {
         const [symbol] = args
         if (!symbol)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} #`)
         if (Array.from(symbol).length !== 1)
            return m.reply('❌ Prefix must be a single character or single emoji.')
         if (symbol.includes('\u200D') || symbol.includes('\uFE0F'))
            return m.reply('❌ Invalid emoji to be used as prefix.')
         if (EvaluateCharacters.has(symbol))
            return m.reply(`❌ Cannot add prefix *"${symbol}"* because an error will occur.`)
         if (setting.prefixes.includes(symbol))
            return m.reply('💭 Symbol already used as prefix.')
         setting.prefixes.push(symbol)
         m.reply(`✅ Successfully add *"${symbol}"* as prefix.`)
      }
      else if (command === '-prefix') {
         const [symbol] = args
         if (!symbol)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} #`)
         if (setting.prefixes.length < 2)
            return m.reply('❌ Can\'t remove more prefix.')
         if (!setting.prefixes.includes(symbol))
            return m.reply('💭 Symbol not exists in database.')
         setting.prefixes.forEach((data, index) => {
            if (data === symbol)
               setting.prefixes.splice(index, 1)
         })
         m.reply(`✅ Successfully removed *"${symbol}"* from database.`)
      }
   },
   owner: true
}