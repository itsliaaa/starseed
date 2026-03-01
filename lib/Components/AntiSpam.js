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

export default () => {
   const storedUser = new Map()

   const cooldown = 3000
   const maxCount = 4

   return (userId) => {
      const now = Date.now()
      const user = storedUser.get(userId)

      if (!user || now >= user.expiry) {
         storedUser.set(userId, {
            expiry: now + cooldown,
            messageCount: 1
         })
         return false
      }

      user.messageCount++

      return user.messageCount > maxCount
   }
}