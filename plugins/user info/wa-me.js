export default {
   command: 'wame',
   category: 'user info',
   async run(m, {
      text
   }) {
      const number = m.quoted ?
         m.quoted.sender :
         m.mentionedJid[0] ||
            m.sender
      text = text || 'Hello!'
      const url = 'https://wa.me/' +
         number.split('@')[0] + '?' +
         encodeURIComponent(text)
      m.reply(url)
   }
}