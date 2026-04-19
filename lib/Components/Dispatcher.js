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

import { Agent, setGlobalDispatcher } from 'undici'

setGlobalDispatcher(
   new Agent({
      connections: 4,
      pipelining: 1,
      keepAliveTimeout: 4000,
      keepAliveMaxTimeout: 15000,
      connectTimeout: 10000,
      bodyTimeout: 60000,
      maxRedirections: 3,
      connect: {
         family: 4
      }
   })
)