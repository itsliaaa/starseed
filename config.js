import { Agent, setGlobalDispatcher } from 'undici'
import { cpus } from 'os'

const cpuCount = cpus().length

Object.assign(global, {
   // Owner name
   ownerName: 'Lia Wynn',

   // Owner phone number
   ownerNumber: '628111111',

   // Bot name
   botName: 'Starseed',

   // Footer text
   footer: '✦ Starseed',

   // [IMPORTANT] Bot phone number for pairing code
   botNumber: '628111111',

   // Pairing using code method (set to false to use QR)
   pairingCode: false,

   // User default limit (used for reset too)
   defaultLimit: 15,

   // Sticker pack name
   stickerPackName: '📦 Starseed Sticker',

   // Sticker pack publisher
   stickerPackPublisher: 'GitHub: itsliaaa',

   // ********** API KEYS ********** //

   // [IMPORTANT] SightEngine for Anti Porn --- https://sightengine.com/
   apiUser: '',
   apiSecret: '',

   // ********** ADVANCED SETTINGS ********** //

   // Local timezone
   localTimezone: 'Asia/Jakarta',

   // Bot thumbnail (optional, you can change it with setcover command)
   botThumbnail: './lib/Media/thumbnail.jpg',

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

   // Interval to clean temporary files (ms)
   temporaryFileInterval: 1_800_000,

   // Persist database to file interval (ms)
   dataInterval: 600_000,

   // Call the garbage collector if exposed (ms)
   gcInterval: 3_600_000,

   // API request timeout
   requestTimeout: 60_000,

   // FFmpeg process timeout
   ffmpegTimeout: 60_000,

   // RSS limit (mb)
   rssLimit: 384 * 1024 * 1024,

   // FFmpeg stream max concurrent processes (min: 1)
   ffmpegConcurrency: Math.max(4, cpuCount * 2)
})

setGlobalDispatcher(
   new Agent({
      connections: 5,
      pipelining: 1,
      keepAliveTimeout: 1_000,
      keepAliveMaxTimeout: 60_000,
      connectTimeout: 5_000,
      bodyTimeout: 30_000,
      maxRedirections: 2
   })
)