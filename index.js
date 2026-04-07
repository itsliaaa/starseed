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

const SETUP_PATH = fileURLToPath(
   new URL('./socket.js', import.meta.url)
)

const [MAJOR, MINOR, PATCH] = process.versions.node
   .split('.')
   .map(value => +value.replace(/\D.*$/, ''))

const Banner = () => {
   console.log('\x1Bc')

   /**
    * Banner characters derived from the "tiny" font by cfonts.
    * Credit to the original authors:
    * https://github.com/dominikwilkowski/cfonts/blob/released/fonts/tiny.json
    */
   const banner = [
      '█▀▀ ▀█▀ ▄▀█ █▀█ █▀▀ █▀▀ █▀▀ █▀▄',
      '▄▄█  █  █▀█ █▀▄ ▄▄█ ██▄ ██▄ █▄▀'
   ]

   const footer = 'GitHub: https://github.com/itsliaaa/starseed'

   const terminalWidth = process.stdout?.columns || 80

   const toCenter = (text) => {
      const padding = Math.floor((terminalWidth - text.length) / 2)
      return ' '.repeat(Math.max(padding, 0)) + text
   }

   banner.forEach(line => console.log(toCenter(line)))
   console.log('\n' + toCenter(footer))
}

const Start = () => {
   const instance = spawn(process.execPath, [
      '--import', './config.js',
      ...process.execArgv,
      SETUP_PATH,
      ...process.argv.slice(2)
   ], {
      stdio: ['inherit', 'inherit', 'inherit', 'ipc']
   })

   instance.once('message', data => {
      if (data === 'leak' || data === 'reset') {
         console[data === 'leak' ? 'warn' : 'log'](
            data === 'leak'
               ? '⚠️ RAM limit reached, restarting...'
               : '🔃 Restarting...'
         )
         instance.kill('SIGTERM')
      }
   })

   instance.once('exit', code => {
      console.error(`⚠️ Exited with code ${code}`)

      if (code !== 0)
         setTimeout(Start, 2000)
   })
}

Banner()

if (
   MAJOR < 20 ||
   (MAJOR == 20 && MINOR < 18) ||
   (MAJOR == 20 && MINOR == 18 && PATCH < 1)
) {
   console.error(
      `\n❌ This script requires Node.js 20.18.1 or above to run reliably.\n` +
      `   You are using Node.js ${process.versions.node}.\n` +
      `   Please upgrade to Node.js 20.18.1 or above to proceed.\n`
   )
   process.exit(1)
}

Start()