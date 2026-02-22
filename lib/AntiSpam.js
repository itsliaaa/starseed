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

export default class AntiSpam {
   static #store = new Map()
   static #cleanerStarted = false

   constructor() {
      this.cooldown = 3000
      this.detect = this.#detect
      AntiSpam.#initCleaner()
   }

   #detect(sender) {
      const now = Date.now()
      const user = AntiSpam.#store.get(sender)

      if (!user || now >= user.expiry) {
         AntiSpam.#store.set(sender, {
            expiry: now + this.cooldown,
            messageCount: 1
         })
         return false
      }

      user.messageCount++

      return user.messageCount > 3
   }

   static #initCleaner() {
      if (this.#cleanerStarted) return
      this.#cleanerStarted = true

      setInterval(() => {
         const now = Date.now()
         for (const [id, user] of this.#store)
            if (now >= user.expiry) this.#store.delete(id)
      }, 60_000)
   }
}