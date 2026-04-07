import { CATEGORY_EMOJIS } from '../../lib/Constants.js'
import { frame, toArray, toTitleCase } from '../../lib/Utilities.js'
import { CommandIndex, ModuleCache } from '../../lib/Watcher.js'

export default {
   command: 'commands',
   category: 'other',
   async run(m, {
      sock
   }) {
      const grouped = Object.create(null)
      for (const { command, category } of ModuleCache.values()) {
         if (!category) continue
         ;(grouped[category] ??= []).push(...toArray(command))
      }
      const print = frame('COMMANDS', Object.keys(grouped)
         .sort()
         .map(category =>
            (CATEGORY_EMOJIS[category] ?? '📁') + ' ' + toTitleCase(category) + ': ' + grouped[category].length
         ), '📏')
      sock.sendText(m.chat, print, m)
   }
}