import { LRUCache } from 'lru-cache'
import { cpus } from 'os'

const CPU_COUNT = cpus().length

Object.assign(globalThis, {
   // Owner name
   ownerName: 'Lia Wynn',

   // Owner phone number
   ownerNumber: '6281111',

   // Bot name
   botName: 'Starseed',

   // Footer text
   footer: '✦ Starseed',

   // [IMPORTANT] Bot phone number for pairing code
   botNumber: '6281111',

   // Pairing using code method (set to true for pairing code, false for QR pairing)
   pairingCode: false,

   // User default limit (used for reset too)
   defaultLimit: 15,

   // Sticker pack name
   stickerPackName: '📦 Starseed Sticker',

   // Sticker pack publisher
   stickerPackPublisher: 'GitHub: itsliaaa',

   // ********** API KEYS ********** //

   // Google AI Studio for Chat Bot @ https://aistudio.google.com/
   googleApiKey: '',

   // SightEngine for Anti Porn @ https://sightengine.com/
   apiUser: '',
   apiSecret: '',

   // ********** ADVANCED SETTINGS ********** //

   // Local timezone
   localTimezone: 'Asia/Jakarta',

   // Bot thumbnail (optional, you can change it with setcover command)
   botThumbnail: './media/Image/thumbnail.jpg',

   // Bot menu music (optional, you can change it with setmenumusic command)
   botMenuMusic: './media/Audio/menu-music.mp3',

   // Temporary folder name (optional)
   temporaryFolder: 'temp',

   // Plugins folder name (optional)
   pluginsFolder: 'plugins',

   // Auth state folder name (optional)
   authFolder: 'session',

   // Store file name (optional)
   storeFilename: 'store.json',

   // Database file name (optional)
   databaseFilename: 'database.json',

   // Interval to clean temporary files (ms)
   temporaryFileInterval: 30 * 60 * 1_000,

   // Persist database to file interval (ms)
   dataInterval: 10 * 60 * 1_000,

   // Call the garbage collector if exposed (ms)
   gcInterval: 1 * 60 * 60 * 1_000,

   // API request timeout (ms)
   requestTimeout: 1.5 * 60 * 1_000,

   // FFmpeg process timeout (ms)
   ffmpegTimeout: 1 * 60 * 1_000,

   // Min delay response (ms)
   minDelay: 100,

   // Max delay response (ms)
   maxDelay: 3 * 1_000,

   // Ignore user old message (sec)
   ignoreOldMessageTS: 30,

   // RSS limit (mb)
   rssLimit: 384 * 1_024 * 1_024,

   // FFmpeg stream max concurrent processes (min: 1)
   ffmpegConcurrency: Math.max(4, Math.floor(CPU_COUNT * 1.3)),

   // Maximum allowed NSFW score (lower values are stricter)
   maxNSFWScore: 0.75,

   // Maximum chat bot history length
   maxHistoryChatSize: 20,

   // Global explore session cache
   ExploreSession: new LRUCache({
      max: 256,
      ttl: 1.5 * 60 * 1_000,
      updateAgeOnGet: false,
      updateAgeOnHas: false,
      ttlAutopurge: true
   })
})