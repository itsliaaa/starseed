const INVALID_EXPRESSION = /^[\s.+\-*/×÷^()eπpi]+$/i
const MATH_EXPRESSION = /^(sin|cos|tan|sqrt|log|abs)\(/

const MATH_MAP = {
   '×': '*',
   '÷': '/',
   'π': 'Math.PI',
   '^': '**',
   '√': 'Math.sqrt'
}

const REVERSE_MAP = {
   'Math.PI': 'π',
   'Math.E': 'e',
   '*': '×',
   '/': '÷',
   '**': '^'
}

export default {
   command: 'calculator',
   hidden: 'cal',
   category: 'tools',
   async run(m, {
      text,
      isPrefix,
      command
   }) {
      const trimmed = text?.trim()
      if (!trimmed)
         return m.reply(`👉🏻 *Example*: ${isPrefix + command} 2 * 5`)
      if (INVALID_EXPRESSION.test(trimmed))
         return m.reply('❌ Invalid expression.')
      let val = trimmed.replace(/[^0-9+\-*/.^()πpieE\s√×÷\w]/gi, '')
      val = val.replace(/×|÷|π|√|\^|pi(?!\w)|\be\b|\b(sin|cos|tan|sqrt|log|abs)\(/gi, match => {
         const lower = match.toLowerCase()
         if (MATH_EXPRESSION.test(lower))
            return `Math.${lower}`
         if (lower === 'pi')
            return 'Math.PI'
         if (lower === 'e')
            return 'Math.E'
         return MATH_MAP[match] || match
      })
      if (/[^0-9Math+\-*/.()\sEPI]/gi.test(val))
         return m.reply('💭 The expression contains invalid characters.')
      try {
         const result = Function('"use strict";return (' + val + ')')()
         if (result === undefined || !Number.isFinite(result))
            return m.reply('❌ Invalid expression or undefined result.')
         let readable = trimmed
         for (const [key, value] of Object.entries(REVERSE_MAP)) readable = readable.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value)
         m.reply(`🧮 *${readable}* = ${result}`)
      }
      catch (error) {
         console.error(error)
         m.reply(`👉🏻 *Example*: ${isPrefix + command} 2 * 5`)
      }
   }
}