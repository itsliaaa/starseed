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

import { watch } from 'fs'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'

import { toArray } from './Utilities.js'

export const FileCache = new Map()
export const ModuleCache = new Map()
export const CommandIndex = new Map()
export const EventIndex = new Set()

const normalizeCommand = (string) =>
   string
      .replace(/\s+/g, '')
      .toLowerCase()

const indexModule = (module) => {
   if (module.command) {
      for (const key of ['command', 'hidden'])
         for (const value of toArray(module[key])) {
            if (typeof value !== 'string') continue

            CommandIndex.set(normalizeCommand(value), module)
         }
   }
   else
      EventIndex.add(module)
}

const unindexModule = (filePath) => {
   const cached = ModuleCache.get(filePath)
   if (!cached) return

   if (cached.command) {
      for (const key of ['command', 'hidden'])
         for (const value of toArray(cached[key]))
            CommandIndex.delete(normalizeCommand(value))
   }
   else
      EventIndex.delete(cached)

   ModuleCache.delete(filePath)
}

export const LoadModule = async (filePath) => {
   try {
      const url = new URL(`file://${join(process.cwd(), filePath)}?update=${Date.now()}`)
      const mod = await import(url.href)
      const module = mod.default ?? mod

      ModuleCache.set(filePath, module)

      indexModule(module)

      return mod
   }
   catch (error) {
      console.error('❌ Failed to load', ':', filePath)
      console.error(error)
   }
}

export const ScanDirectory = async (dir) => {
   const entries = await readdir(dir, { withFileTypes: true })

   for (const entry of entries) {
      const fullPath = join(dir, entry.name)

      if (entry.isDirectory()) {
         await ScanDirectory(fullPath)
         continue
      }
      else if (entry.isFile() || fullPath.endsWith('.js')) {
         const stats = await stat(fullPath)

         FileCache.set(fullPath, {
            mtimeMs: stats.mtimeMs,
            size: stats.size
         })

         await LoadModule(fullPath)
      }
   }

   await WatchDirectory(dir)
}

export const WatchDirectory = async (dir) => {
   watch(dir, (event, filename) => {
      if (!filename) return

      handleChange(join(dir, filename))
   })

   const entries = await readdir(dir, { withFileTypes: true })

   for (const entry of entries)
      if (entry.isDirectory())
         WatchDirectory(join(dir, entry.name))
}

export const handleChange = async (filePath) => {
   let stats
   try {
      stats = await stat(filePath)
   }
   catch {
      FileCache.delete(filePath)
      unindexModule(filePath)

      return console.log('🗑️ Deleted:', filePath)
   }

   if (!stats.isFile() || !filePath.endsWith('.js')) return

   const cached = FileCache.get(filePath)

   if (!cached) {
      FileCache.set(filePath, {
         mtimeMs: stats.mtimeMs,
         size: stats.size
      })

      await LoadModule(filePath)
      return console.log('➕ Added:', filePath)
   }

   if (cached.mtimeMs !== stats.mtimeMs || cached.size !== stats.size) {
      FileCache.set(filePath, {
         mtimeMs: stats.mtimeMs,
         size: stats.size
      })

      unindexModule(filePath)
      await LoadModule(filePath)
      console.log('🔔 Updated:', filePath)
   }
}