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

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import CFonts from 'cfonts'

const file = fileURLToPath(
   new URL('./handler.js', import.meta.url)
)
const major = parseInt(
   process.versions.node.split('.')[0],
   10
)

const Start = () => {
   const p = spawn(process.execPath, [
      ...process.execArgv,
      file,
      ...process.argv.slice(2)
   ], {
      stdio: ['inherit', 'inherit', 'inherit', 'ipc']
   })

   p.once('message', data => {
      if (data === 'leak' || data === 'reset') {
         console[data === 'leak' ? 'warn' : 'log'](
            data === 'leak'
               ? '⚠️ RAM limit reached, restarting...'
               : '🔃 Restarting...'
         )
         p.kill('SIGTERM')
      }
   })

   p.once('exit', code => {
      console.error(`⚠️ Exited with code ${code}`)

      if (code !== 0)
         setTimeout(Start, 1000)
   })
}

console.log('\x1Bc')

CFonts.say('STARSEED', {
   font: 'tiny',
   align: 'center',
   gradient: ['#F8ACD8', '#CCE8FD']
})

CFonts.say('GitHub: https://github.com/itsliaaa/starseed', {
   colors: ['system'],
   font: 'console',
   align: 'center'
})

if (major < 22) {
   console.error(
      `\n❌ This script requires Node.js 22+ to run reliably.\n` +
      `   You are using Node.js ${process.versions.node}.\n` +
      `   Please upgrade to Node.js 22+ to proceed.\n`
   )
   process.exit(0)
}

Start()