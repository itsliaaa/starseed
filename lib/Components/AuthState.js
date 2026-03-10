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

import { BufferJSON, initAuthCreds, makeCacheableSignalKeyStore, proto } from '@itsliaaa/baileys'
import { mkdir, readFile, rename, stat, unlink, writeFile } from 'fs/promises'
import { Mutex } from 'async-mutex'
import { join } from 'path'

const fixFileName = (fileName) =>
   fileName?.replace(/\//g, '__')?.replace(/:/g, '-')

const atomicWrite = async (fileName, data) => {
   const temp = fileName + '.temp'
   await writeFile(temp, data)
   await rename(temp, fileName)
}

export default async (folder = authFolder) => {
   const Processing = new Map()
   const FileLock = new Map()

   const getFileLock = (filePath) => {
      if (!FileLock.has(filePath))
         FileLock.set(filePath, new Mutex())
      return FileLock.get(filePath)
   }

   const folderInfo = await stat(folder).catch(() => { })
   if (folderInfo && !folderInfo.isDirectory())
      throw new Error(`❌ Found something that is not a directory at ${folder}, either delete it or specify a different location`)
   else
      await mkdir(folder, { recursive: true })

   const readData = async (fileName) => {
      if (Processing.has(fileName))
         return Processing.get(fileName)

      const filePath = join(folder, fixFileName(fileName))
      const mutex = getFileLock(filePath)

      const task = mutex
         .runExclusive(async () => {
            try {
               const value = JSON.parse(
                  await readFile(filePath, 'utf-8'),
                  BufferJSON.reviver
               )
               return value
            }
            catch (error) {
               if (error.code === 'ENOENT') return null
               throw error
            }
            finally {
               Processing.delete(fileName)
            }
         })

      Processing.set(fileName, task)
      return task
   }

   const writeData = async (fileName, value) => {
      const filePath = join(folder, fixFileName(fileName))
      const mutex = getFileLock(filePath)

      return mutex
         .runExclusive(async () => {
            const json = JSON.stringify(value, BufferJSON.replacer)
            await atomicWrite(filePath, json)
         })
   }

   const removeData = async (fileName) => {
      const filePath = join(folder, fixFileName(fileName))
      const mutex = getFileLock(filePath)

      return mutex
         .runExclusive(async () => {
            try {
               await unlink(filePath)
            }
            catch (error) {
               if (error.code !== 'ENOENT')
                  throw error
            }
         })
   }

   const creds = (await readData('creds.json')) || initAuthCreds()

   return {
      state: {
         creds,
         keys: makeCacheableSignalKeyStore({
            get: async (type, ids) => {
               const data = {}

               await Promise.all(
                  ids.map(async (id) => {
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
         })
      },
      saveCreds: () =>
         writeData('creds.json', creds)
   }
}