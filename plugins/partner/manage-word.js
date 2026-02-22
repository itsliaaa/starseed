export default {
   command: ['+word', '-word'],
   category: 'partner',
   async run (m, {
      setting,
      isPrefix,
      command,
      args
   }) {
      if (command === '+word') {
         const [word] = args
         if (!word)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} fuck`)
         if (setting.forbiddenWords.includes(word))
            return m.reply('💭 Already in database.')
         setting.forbiddenWords.push(word)
         m.reply(`✅ Successfully add *"${word}"* to database.`)
      }
      else if (command === '-word') {
         const [word] = args
         if (!word)
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} fuck`)
         if (setting.forbiddenWords.length < 2)
            return m.reply('❌ Can\'t remove more prefix.')
         if (!setting.forbiddenWords.includes(word))
            return m.reply('💭 Word not exists in database.')
         setting.forbiddenWords.forEach((data, index) => {
            if (data === word)
               setting.forbiddenWords.splice(index, 1)
         })
         m.reply(`✅ Successfully removed *"${word}"* from database.`)
      }
   },
   partner: true
}