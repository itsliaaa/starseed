import { readdir, readFile, stat, unlink, writeFile } from 'fs/promises'
import { join } from 'path'

import { formatSize, formatTime, frame } from '../../lib/Utilities.js'

const getAllPluginsPath = async () => {
   const result = []

   const scan = async (directory) => {
      const entries = await readdir(directory, { withFileTypes: true })

      for (const entry of entries) {
         const fullPath = join(directory, entry.name)

         if (entry.isDirectory())
            await scan(fullPath)
         else
            result.push(fullPath)
      }
   }

   await scan(join(pluginsFolder))

   return result
}

const sanitizeCode = (qBody) => {
   const lines = qBody.split('\n')

   let foundCode = false

   return lines.map(line => {
      const trimmed = line.trim()

      if (
         trimmed.startsWith('import ') ||
         trimmed.startsWith('export ') ||
         trimmed.startsWith('const ') ||
         trimmed.startsWith('let ') ||
         trimmed.startsWith('var ') ||
         trimmed.startsWith('async ') ||
         trimmed.startsWith('function ') ||
         trimmed.startsWith('{')
       )
         foundCode = true

      if (!foundCode)
         return `// ${line}`

      return line
   }).join('\n')
}

const hasValidPluginContent = (body) =>
   !body.includes('require(') &&
   !body.includes('module.exports') &&
   body.includes('export default {') &&
   body.includes('run(m') &&
   body.includes('}')

export default {
   command: ['delplugin', 'getplugin', 'saveplugin'],
   hidden: ['dp', 'gp', 'sp'],
   category: 'owner',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      if (!text)
         return m.reply(`👉🏻 *Example*: ${isPrefix + command} menu`)
      if (command === 'delplugin' || command === 'dp') {
         const allPluginsPath = await getAllPluginsPath()
         const pluginPath = allPluginsPath.find(path => path.includes(text))
         if (!pluginPath)
            return m.reply('❌ Plugin not found.')
         await unlink(pluginPath)
         m.reply('✅ Successfully delete plugin.')
      }
      else if (command === 'getplugin' || command === 'gp') {
         const allPluginsPath = await getAllPluginsPath()
         const pluginPath = allPluginsPath.find(path => path.includes(text))
         if (!pluginPath)
            return m.reply('❌ Plugin not found.')
         const plugin = await readFile(pluginPath, 'utf8')
         const fileStatistic = await stat(pluginPath)
         const printHeader = frame('PLUGIN INFO', [
            `*Size*: ${formatSize(plugin.length)}`,
            `*Source*: ${pluginPath}`,
            `*Created At*: ${formatTime(undefined, fileStatistic.birthtime)}`,
            `*Modified At*: ${formatTime(undefined, fileStatistic.mtime)}`
         ], '🔧')
         sock.sendMessage(m.chat, {
            headerText: printHeader,
            code: plugin,
            language: 'javascript'
         }, {
            quoted: m
         })
      }
      else if (command === 'saveplugin' || command === 'sp') {
         const qBody = m.quoted?.body
         if (!qBody)
            return m.reply('💭 Reply plugin message.')
         if (!hasValidPluginContent(qBody))
            return m.reply('❌ Invalid plugin content.')
         const savedPath = join(pluginsFolder, text)
         await writeFile(savedPath, sanitizeCode(qBody))
         m.reply('✅ Successfully saved plugin to: ' + savedPath)
      }
   },
   owner: true
}