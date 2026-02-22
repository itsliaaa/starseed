import { DE_MORSE, MORSE } from '../../lib/Constants.js'

export default {
   command: ['morse', 'dmorse'],
   category: 'tools',
   async run(m, {
      isPrefix,
      command,
      text
   }) {
      text = m.quoted ? m.quoted.body : text
      if (command === 'morse') {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} hi`)
         m.reply(
            text
               .toLowerCase()
               .split(/\s+/)
               .map(word => [...word].map(ch => MORSE[ch] || ch)
               .join(' '))
               .join(' / ')
         )
      }
      else if (command === 'dmorse') {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} –•––•–`)
         m.reply(
            text
               .split(/\s*\/\s*/g)
               .map(word => word.split(/\s+/)
               .map(code => DE_MORSE[code] || code)
               .join(''))
               .join(' ')
         )
      }
   }
}