export default {
   command: 'wame',
   category: 'user info',
   async run(m, {
      text
   }) {
      const number = m.quoted ? m.quoted.sender : m.sender
      text = text || 'Hello!'
      const url = 'https://wa.me/' +
         number.split('@')[0] + '?' +
         new URLSearchParams({
            text
         })
      m.reply(url)
   }
}