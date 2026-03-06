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

import { BufferJSON, initAuthCreds, proto } from '@itsliaaa/baileys'
import { mkdir, readFile, stat, unlink, writeFile } from 'fs/promises'
import { Mutex } from 'async-mutex'
import { join } from 'path'

const fixFileName = (fileName) =>
   fileName?.replace(/\//g, '__')?.replace(/:/g, '-')

export default async (folder = authFolder) => {
   const FileCache = new Map()
   const WriteLock = new Mutex()

   const readData = async (fileName) => {
      if (FileCache.has(fileName)) return FileCache.get(fileName)

      try {
         const data = await readFile(
            join(folder, fixFileName(fileName)),
            'utf-8'
         )
         const parsed = JSON.parse(data, BufferJSON.reviver)
         FileCache.set(fileName, parsed)
         return parsed
      }
      catch {
         return null
      }
   }

   const writeData = async (data, fileName) => {
      const previous = FileCache.get(fileName)
      if (previous === data) return

      FileCache.set(fileName, data)

      await WriteLock.runExclusive(async () => {
         await writeFile(
            join(folder, fixFileName(fileName)),
            JSON.stringify(data, BufferJSON.replacer),
            'utf-8'
         )
      })
   }

   const removeData = async (fileName) => {
      FileCache.delete(fileName)

      await WriteLock.runExclusive(async () => {
         try {
            await unlink(
               join(folder, fixFileName(fileName))
            )
         }
         catch { }
      })
   }

   const folderInfo = await stat(folder).catch(() => { })
   if (folderInfo) {
      if (!folderInfo.isDirectory())
         throw new Error(`❌ Found something that is not a directory at ${folder}, either delete it or specify a different location`)
   }
   else
      await mkdir(folder, { recursive: true })

   const creds = (await readData('creds.json')) || initAuthCreds()

   return {
      state: {
         creds,
         keys: {
            get: async (type, ids) => {
               const data = {}

               for (const id of ids) {
                  const fileName = type + '-' + id + '.json'
                  let value =
                     FileCache.get(fileName) ||
                     (await readData(fileName))
                  if (type === 'app-state-sync-key' && value)
                     value = proto.Message.AppStateSyncKeyData.fromObject(value)
                  data[id] = value
               }

               return data
            },
            set: async (data) => {
               for (const category in data) {
                  for (const id in data[category]) {
                     const fileName = category + '-' + id + '.json'
                     const value = data[category][id]
                     if (value)
                        await writeData(value, fileName)
                     else
                        await removeData(fileName)
                  }
               }
            }
         }
      },
      saveCreds: async () =>
         await writeData(creds, 'creds.json')
   }
}