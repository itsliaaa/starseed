import { nexray } from '../../lib/Request.js'

export default {
   command: ['ai', 'copilot', 'deepsearch', 'dgaf', 'dolphin', 'dreamanalyze', 'gita', 'glm', 'nexray', 'perplexity'],
   category: 'ai',
   async run(m, {
      sock,
      isPrefix,
      command,
      text
   }) {
      try {
         if (!text)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} hello`)
         m.react('🕒')
         const path = command === 'ai' ?
            'asisten' :
            command === 'gita' ?
               'gitagpt' :
               command
         const params = { text }
         if (command === 'dolphin')
            params.template = 'logical'
         if (command === 'glm')
            params.model = 'glm-4.6'
         const data = await nexray('ai/' + path, params)
         if (!data.status)
            return m.reply('❌ Failed to get data.')
         m.reply(data.result)
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}