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
   const FileLock = new Map()

   const getFileLock = (path) => {
      if (!FileLock.has(path))
         FileLock.set(path, new Mutex())
      return FileLock.get(path)
   }

   const filePath = (fileName) =>
      join(folder, fixFileName(fileName))

   const readData = async (fileName) => {
      if (FileCache.has(fileName))
         return FileCache.get(fileName)
      const mutex = getFileLock(filePath(fileName))
      const release = await mutex.acquire()
      try {
         const value = JSON.parse(
            await readFile(
               filePath(fileName),
               'utf-8'
            ),
            BufferJSON.reviver
         )
         FileCache.set(fileName, value)
         return value
      }
      catch {
         return null
      }
      finally {
         release()
      }
   }

   const writeData = async (fileName, value) => {
      FileCache.set(fileName, value)
      const mutex = getFileLock(filePath(fileName))
      const release = await mutex.acquire()
      try {
         await writeFile(
            filePath(fileName),
            JSON.stringify(value, BufferJSON.replacer),
            'utf-8'
         )
      }
      finally {
         release()
      }
   }

   const removeData = async (fileName) => {
      FileCache.delete(fileName)
      const mutex = getFileLock(filePath(fileName))
      const release = await mutex.acquire()
      try {
         await unlink(filePath(fileName))
      }
      catch { }
      finally {
         release()
      }
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

               await Promise.all(
                  ids.map(async id => {
                     let value = await readData(type + '-' + id + '.json')
                     if (type === 'app-state-sync-key' && value)
                        value = proto.Message.AppStateSyncKeyData.fromObject(value)
                     data[id] = value
                  })
               )

               return data
            },
            set: async (data) => {
               const tasks = []

               for (const category in data)
                  for (const id in data[category]) {
                     const fileName = category + '-' + id + '.json'
                     const value = data[category][id]
                     if (value)
                        tasks.push(writeData(fileName, value))
                     else
                        tasks.push(removeData(fileName))
                  }

               await Promise.all(tasks)
            }
         }
      },
      saveCreds: async () =>
         writeData('creds.json', creds)
   }
}