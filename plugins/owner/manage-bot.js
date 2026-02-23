import { isJidNewsletter } from '@itsliaaa/baileys'
import { Zip, ZipDeflate } from 'fflate'
import { createWriteStream, createReadStream } from 'fs'
import { readdir, rename } from 'fs/promises'
import { basename, join, relative, resolve } from 'path'

import { createFileName, isMimeImage, persistToFile } from '../../lib/Utilities.js'

const MENU_STYLES = {
   1: '🌱 `Extended Text Message` with `externalAdReply`.',
   2: '👉🏻 `Interactive Message` with `single_select`.',
   3: '🏷️ `Interactive Message` with `bottom_sheet` and `limited_time_offer`.',
   4: '🛒 `Interactive Message` with `Product Header`.',
   5: '🛒 `Interactive Message` with `Product Header` and `bottom_sheet`.',
   6: '🛒 `Interactive Message` with `Document Header`, `bottom_sheet`, and `externalAdReply`.',
   7: '🖼️ `Interactive Message` with `Carousel Message`.'
}

const EXCLUDE = new Set(['node_modules', 'yarn.lock', '.git', 'session', databaseFilename, storeFilename, temporaryFolder])

const writeAndDrain = (stream, chunk) =>
   new Promise((res, rej) => {
      const ok = stream.write(chunk)
      if (ok) return res()
      stream.once('drain', res)
      stream.once('error', rej)
   })

const addDirectory = async (zip, dir, base) => {
   const entries = await readdir(dir, { withFileTypes: true })

   for (const entry of entries) {
      if (EXCLUDE.has(entry.name)) continue
      if (entry.name.startsWith('.')) continue
      if (entry.isSymbolicLink()) continue

      const fullPath = join(dir, entry.name)
      const relPath = relative(base, fullPath)

      if (entry.isDirectory()) {
         await addDirectory(zip, fullPath, base)
      } else if (entry.isFile()) {
         await addStream(zip, fullPath, relPath)
      }
   }
}

const addStream = async (zip, fullPath, relPath, outputStream) => {
   const deflate = new ZipDeflate(relPath, { level: 6 })

   const origOndata = deflate.ondata
   deflate.ondata = async (err, data, final) => {
      if (err) throw err
      await writeAndDrain(outputStream, data)
      if (origOndata) origOndata(err, data, final)
   }

   zip.add(deflate)

   const stream = createReadStream(fullPath, { highWaterMark: 64 * 1024 })
   for await (const chunk of stream) {
      deflate.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk))
      await new Promise(r => setImmediate(r))
   }

   deflate.push(new Uint8Array(0), true)
}

const wrap = () =>
   new Promise(async (resolve, reject) => {
      const fileName = join(temporaryFolder, `Starseed-${createFileName()}.zip`)
      const output = createWriteStream(fileName)

      const zip = new Zip((err, chunk, final) => {
         if (err) return reject(err)
         output.write(chunk)
         if (final) {
            output.end()
            resolve(fileName)
         }
      })

      try {
         await addDirectory(zip, process.cwd(), process.cwd())
         zip.end()
      } catch (err) {
         reject(err)
      }
   })

const atomicWrite = async (db, store) =>
   Promise.all([
      db.writeToFile(),
      store.writeToFile()
   ])

export default {
   command: ['backup', 'backupsc', 'disable', 'enable', 'gconly', 'resetlimit', 'restart', 'restore', 'setbroadcastcd', 'setmenu', 'setname', 'setbio', 'setpp', 'setcover', 'setchid', 'public', 'self', '+prefix', '-prefix'],
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
      if (command === 'backup') {
         m.react('🕒')
         await atomicWrite(db, store)
         sock.sendMedia(m.chat, resolve(databaseFilename), '✅ Backup completed.', m, {
            fileName: databaseFilename
         })
      }
      else if (command === 'backupsc') {
         m.react('🕒')
         const filePath = await wrap()
         sock.sendMedia(m.chat, filePath, '✅ Backup success.', m, {
            document: true,
            fileName: basename(filePath)
         })
      }
      else if (command === 'disable') {
         const [cmd] = args
         if (!cmd)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} claim`)
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
      else if (command === 'gconly') {
         const [option] = args
         if (!option)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} on`)
         if (option !== 'on' && option !== 'off')
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} on`)
         const isActivating = option === 'on'
         let print = isActivating ?
            `❌ Group Only already activated.` :
            `❌ Group Only already deactivated.`
         if (setting.groupOnly === isActivating)
            return m.reply(print)
         setting.groupOnly = isActivating
         print = isActivating ?
            `✅ Successfully activating Group Only.` :
            `✅ Successfully deactivating Group Only.`
         m.reply(print)
      }
      else if (command === 'resetlimit') {
         for (const user of db.database.users.values())
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
         if (!value)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} 10000`)
         setting.broadcastCooldown = value
         m.reply(`✅ Successfully set broadcast cooldown to *${value}* ms.`)
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
      else if (command === 'setname') {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} Starseed`)
         if (text.length > 25)
            return m.reply('❌ Max characters for profile name is 25.')
         await sock.updateProfileName(text)
         m.reply('✅ Successfully change the profile name.')
      }
      else if (command === 'setbio') {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} WhatsApp Automation`)
         if (text.length > 50)
            return m.reply('❌ Max characters for profile bio is 50.')
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
         const filePath = await persistToFile(buffer)
         await rename(filePath,
            join('lib', 'Media', 'thumbnail.jpg')
         )
         m.reply('✅ Successfully set cover.')
      }
      else if (command === 'setchid') {
         if (!args.length)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} 12111111111111@newsletter`)
         if (!isJidNewsletter(args[0]))
            return m.reply('❌ Invalid newsletter id')
         setting.newsletterId = args[0]
         m.reply('✅ Successfully set newsletter id.')
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
      else if (command === '+prefix') {
         const [symbol] = args
         if (!symbol)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} #`)
         if (Array.from(symbol).length !== 1)
            return m.reply('❌ Prefix must be a single character or single emoji.')
         if (symbol.includes('\u200D') || symbol.includes('\uFE0F'))
            return m.reply('❌ Invalid emoji to be used as prefix.')
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