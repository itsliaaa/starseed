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

import { mkdir, readFile, rename, writeFile } from 'fs/promises'
import { basename, dirname, resolve } from 'path'

import { MAX_MESSAGES, SCHEMA } from './Constants.js'
import { applySchema } from './Utilities.js'

export const LocalDatabase = (fileName = databaseFilename) => {
   const filePath = resolve(process.cwd(), fileName)

   let isWriting = false,
      isPending = false

   const read = async (file = filePath) => {
      try {
         const content = await readFile(file, 'utf-8').catch(async () => {
            await mkdir(dirname(file), { recursive: true })
            await writeFile(file, '{}', 'utf-8')
            return '{}'
         })

         return JSON.parse(content, (key, value) => {
            if (!value?.data || !value.__type)
               return value

            const buffer = Buffer.from(value.data, 'base64')
            if (value.__type === 'Buffer')
               return buffer
            if (value.__type === 'ArrayBuffer')
               return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)

            const TypedArray = globalThis[value.__type]
            return TypedArray ?
               new TypedArray(buffer.buffer, buffer.byteOffset, buffer.byteLength / TypedArray.BYTES_PER_ELEMENT) :
               value
         })
      }
      catch (e) {
         console.error(`❌ There was a problem reading ${basename(file)}`, ':', e)
         return {}
      }
   }

   const write = async (data = {}) => {
      if (isWriting) {
         isPending = true
         return
      }

      isWriting = true
      try {
         await mkdir(dirname(filePath), { recursive: true })
         const seen = new WeakSet()

         const json = JSON.stringify(data, (key, value) => {
            if (typeof value === 'function') return

            if (value?.type === 'Buffer' && Array.isArray(value?.data))
               return {
                  __type: 'Buffer',
                  data: Buffer.from(value.data).toString('base64')
               }

            if (Buffer.isBuffer(value))
               return {
                  __type: 'Buffer',
                  data: value.toString('base64')
               }

            if (value instanceof ArrayBuffer)
               return {
                  __type: 'ArrayBuffer',
                  data: Buffer.from(value).toString('base64')
               }

            if (ArrayBuffer.isView(value))
               return {
                  __type: value.constructor.name,
                  data: Buffer.from(value.buffer, value.byteOffset, value.byteLength).toString('base64')
               }

            if (value && typeof value === 'object') {
               if (seen.has(value)) return
               seen.add(value)
            }

            return value
         })

         const temp = filePath + '.temp'
         await writeFile(temp, json, 'utf-8')
         await rename(temp, filePath)
      }
      catch (e) {
         console.error(`❌ There was a problem saving ${basename(filePath)}`, ':', e)
      }
      finally {
         isWriting = false
         if (isPending) {
            isPending = false
            await write(data)
         }
      }
   }

   return {
      read,
      write
   }
}

export const Database = (databasePath = databaseFilename) => {
   const db = LocalDatabase(databasePath)

   const database = {
      users: new Map(),
      groups: new Map(),
      settings: Object.create(null)
   }

   return {
      database,
      updateUser(id, value) {
         database.users.set(id, {
            ...database.users.get(id) || {},
            ...value
         })
      },
      getUser(id) {
         return database.users.get(id)
      },
      hasUser(id) {
         return database.users.has(id)
      },
      deleteUser(id) {
         database.users.delete(id)
      },
      updateGroup(id, value) {
         database.groups.set(id, {
            ...database.groups.get(id) || {},
            ...value
         })
      },
      getGroup(id) {
         return database.groups.get(id)
      },
      hasGroup(id) {
         return database.groups.has(id)
      },
      deleteGroup(id) {
         database.groups.delete(id)
      },
      updateSetting(option, value) {
         database.settings[option] = value
      },
      getSetting() {
         return database.settings
      },
      async readFromFile(file) {
         const raw = await db.read(file)

         database.users.clear()
         for (const [id, data] of Object.entries(raw.users || {})) {
            applySchema(data, SCHEMA.User)
            database.users.set(id, data)
         }

         database.groups.clear()
         for (const [id, data] of Object.entries(raw.groups || {})) {
            applySchema(data, SCHEMA.Group)
            database.groups.set(id, data)
         }

         let setting = Object.assign(
            Object.create(null),
            raw.settings || {}
         )

         applySchema(setting, SCHEMA.Setting)
         Object.assign(database.settings, setting)
      },
      async writeToFile() {
         const out = {
            users: Object.create(null),
            groups: Object.create(null),
            settings: Object.create(null)
         }

         for (const [id, data] of database.users)
            out.users[id] = data

         for (const [id, data] of database.groups)
            out.groups[id] = data

         out.settings = database.settings

         await db.write(out)
      }
   }
}

export const Store = (storePath = storeFilename) => {
   const db = LocalDatabase(storePath)

   const store = {
      messages: Object.create(null),
      groupMetadata: new Map()
   }

   return {
      store,
      setMessage(message) {
         let chat = store.messages[message.chat]
         if (!chat)
            chat = store.messages[message.chat] = new Map()

         if (chat.has(message.id))
            chat.delete(message.id)

         chat.set(message.id, message)

         if (chat.size > MAX_MESSAGES) {
            const oldestKey = chat.keys().next().value
            chat.delete(oldestKey)
         }
      },
      getMessage(message) {
         return store.messages[message.chat]?.get(message.id)
      },
      hasMessage(message) {
         return store.messages[message.chat]?.has(message.id)
      },
      deleteMessage(message) {
         store.messages[message.chat]?.delete(message.id)
      },
      setGroup(id, metadata) {
         store.groupMetadata.set(id, metadata)
      },
      getGroup(id) {
         return store.groupMetadata.get(id)
      },
      hasGroup(id) {
         return store.groupMetadata.has(id)
      },
      deleteGroup(id) {
         store.groupMetadata.delete(id)
      },
      async readFromFile(file) {
         const raw = await db.read(file)

         store.messages = Object.create(null)
         for (const [chatId, messages] of Object.entries(raw.messages || {}))
            store.messages[chatId] = new Map(Object.entries(messages))

         store.groupMetadata.clear()
         for (const [id, metadata] of Object.entries(raw.groupMetadata || {}))
            store.groupMetadata.set(id, metadata)
      },
      async writeToFile() {
         const out = {
            messages: Object.create(null),
            groupMetadata: Object.create(null)
         }

         for (const [chatId, map] of Object.entries(store.messages))
            out.messages[chatId] = Object.fromEntries(map)

         for (const [id, metadata] of store.groupMetadata)
            out.groupMetadata[id] = metadata

         await db.write(out)
      }
   }
}