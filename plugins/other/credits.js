/**
 * This file is part of the Starseed Bot WhatsApp project, solely developed and maintained by Lia Wynn.
 * https://github.com/itsliaaa/starseed
 *
 * All rights reserved.
 *
 * - You are NOT allowed to copy, rewrite, modify, redistribute, or reuse this file in any form.
 * - You are NOT allowed to claim this file or any part of this project as your own.
 * - This credit notice must NOT be removed or altered.
 * - This file may ONLY be used within the Starseed project.
 */

import { DONATE_URL } from '@itsliaaa/baileys'

import { fetchThumbnail, frame, greeting } from '../../lib/Utilities.js'

export default {
   command: ['credits', 'script'],
   hidden: 'sc',
   category: 'other',
   async run(m) {
      const printCredits = frame('CREDITS', [
         'itsliaaa — Project Maintainer & Creator'
      ], '👤')
      const printAPIs = frame('THIRD-PARTY SERVICES', [
         'rynn-k — Nekolabs API',
         'elrayyxml — Nexray API',
         'Deline Clarissa — Deline API'
      ], '🌐')
      const printTesters = frame('TESTERS & COMMUNITY', [
         'Starseed Group Members',
         'And of course… *You* ✨'
      ], '🧪')
      const printSourceCode = frame('SOURCE CODE', [
         'https://github.com/itsliaaa Coming Soon (⁠･ั⁠ω⁠･ั⁠)'
      ], '🧩')
      const printDonateUrl = frame('DONATE', [
         DONATE_URL
      ], '💰')
      m.reply(printCredits + '\n\n' +
         printAPIs + '\n\n' +
         printTesters + '\n\n' +
         printSourceCode + '\n\n' +
         printDonateUrl, {
         externalAdReply: {
            title: botName,
            body: greeting(),
            thumbnail: await fetchThumbnail(),
            largeThumbnail: true
         }
      })
   }
}