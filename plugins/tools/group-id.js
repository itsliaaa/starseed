import { LRUCache } from 'lru-cache'

import { MINUTE } from '../../lib/Constants.js'
import { fetchAsBuffer, frame, greeting } from '../../lib/Utilities.js'

const GroupCache = new LRUCache({
   max: 128,
   ttl: 3 * MINUTE,
   updateAgeOnGet: false,
   updateAgeOnHas: false,
   ttlAutopurge: true
})

export default {
   command: 'groupid',
   hidden: ['idgroup', 'cekidgc'],
   category: 'tools',
   async run(m, {
      sock,
      isPrefix,
      command,
      args
   }) {
      try {
         if (!args[0])
            return m.reply(`👉🏻 *Example*: ${isPrefix + command} https://chat.whatsapp.com/K0wc14jRGX94CMbfzcEnlC`)
         if (!args[0].includes('chat.whatsapp.com/')) return m.reply('❌ Invalid URL.')
         m.react('🕒')
         const inviteCode = args[0]
            .split('chat.whatsapp.com/')[1]
            ?.split('?')[0]
         const previousResult = GroupCache.get(inviteCode)
         let groupMetadata = previousResult
         if (!groupMetadata)
            groupMetadata = await sock.groupGetInviteInfo(inviteCode).catch(() => null)
         GroupCache.set(inviteCode, groupMetadata)
         if (!groupMetadata?.id)
            return m.reply('❌ Failed to get data.')
         const groupOwner = groupMetadata.ownerPn?.split('@')[0]
         const groupAdmin = groupMetadata.participants.filter(participant => participant.admin)
         const groupPicture = await sock.profilePicture(groupMetadata.id)
         const print = frame('GROUP INFO', [
            `*ID*: ${groupMetadata.id}`,
            `*Name*: ${groupMetadata.subject}`,
            `*Admin*: ${groupAdmin.length}`,
            `*Member*: ${groupMetadata.size}`,
            `*Owner*: @${groupOwner || 0}`
         ], '🧑‍🧑‍🧒‍🧒')
         m.reply(print, {
            title: botName,
            description: greeting(),
            thumbnail: await fetchAsBuffer(groupPicture),
            width: 512,
            height: 512,
            largeThumbnail: true
         })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}