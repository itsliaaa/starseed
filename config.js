import { Agent, setGlobalDispatcher } from 'undici'
import { cpus } from 'os'

const cpuCount = cpus().length

Object.assign(global, {
   // Owner name
   ownerName: 'Lia Wynn',

   // Owner phone number
   ownerNumber: '6281111111111',

   // Bot name
   botName: 'Starseed',

   // Bot phone number (IMPORTANT for pairing code)
   botNumber: '6281111111111',

   // Footer text
   footer: '✦ Starseed',

   // User default limit (used for reset too)
   defaultLimit: 15,

   // Pairing using code method (set to false to use QR)
   pairingCode: false,

   // Sticker pack name
   stickerPackName: '📦 Starseed Sticker',

   // Sticker pack publisher
   stickerPackPublisher: 'GitHub: itsliaaa',

   // ********** ADVANCED SETTINGS ********** //

   // Read messages
   onlineStatus: true,

   // Slow mode (important to avoid being banned by Meta)
   slowMode: false,

   // Auth state folder name (optional)
   authFolder: 'session',

   // Temporary folder name (optional)
   temporaryFolder: 'temp',

   // Plugins folder name (optional)
   pluginsFolder: 'plugins',

   // Store file name (optional)
   storeFilename: 'store.json',

   // Database file name (optional)
   databaseFilename: 'database.json',

   // Bot thumbnail (optional, you can change it with setcover command)
   botThumbnail: './lib/Media/thumbnail.jpg',

   // Local timezone
   localTimezone: 'Asia/Jakarta',

   // Interval to clean temporary files (ms)
   temporaryFileInterval: 1_800_000,

   // Persist database to file interval (ms)
   dataInterval: 300_000,

   // API request timeout
   requestTimeout: 60_000,

   // FFmpeg process timeout
   ffmpegTimeout: 30_000,

   // RSS limit (mb)
   rssLimit: 500 * 1024 * 1024,

   // FFmpeg stream max concurrent processes (min: 1)
   ffmpegConcurrency: Math.max(1, cpuCount - 1)
})

setGlobalDispatcher(
   new Agent({
      connections: 2,
      pipelining: 1,
      keepAliveMaxTimeout: 15_000,
      connectTimeout: 10_000,
      bodyTimeout: 30_000,
      maxRedirections: 2,
      connect: {
         family: 4
      }
   })
)