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

export const MENTION_REGEX = /@([0-9]{5,16}|0)/g
export const NEWSLETTER_URL_REGEX = /\/channel\/([a-zA-Z0-9]+)/
export const WHATSAPP_URL_REGEX = /https?:\/\/(www\.)?(chat\.whatsapp\.com\/[A-Za-z0-9]+|whatsapp\.com\/channel\/[A-Za-z0-9]+)/i

export const SECOND = 1000
export const MINUTE = 60 * SECOND
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR

export const INACTIVE_THRESHOLD = 7 * DAY

export const MAX_MESSAGES = 128

export const FONT_SOURCE = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export const OWNER_VCARD =
   'BEGIN:VCARD' +
   '\nVERSION:3.0' +
   `\nFN:${ownerName}` +
   `\nORG:Starfall Co. Ltd.;` +
   `\nTEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}` +
   '\nEND:VCARD'

export const CATEGORY_DESCRIPTIONS = {
   'admin tools': 'Commands for managing group members, permissions, and moderation settings.',
   ai: 'AI-powered commands for intelligent replies, content generation, and smart interactions.',
   downloader: 'Commands for downloading media content from supported platforms.',
   group: 'Commands designed to enhance group interaction and engagement.',
   maker: 'Commands for generating images, stickers, and other creative content.',
   owner: 'Restricted commands for the bot owner and partners to manage and configure the system.',
   'sound effect': 'Commands for applying effects and processing audio.',
   tools: 'Utility commands for conversion, formatting, and other practical tasks.',
   'user info': 'Commands for viewing user profiles, status, statistics, and related information.',
   other: 'Commands that do not fit into the available categories.'
}

export const CATEGORY_EMOJIS = {
   'admin tools': '🧑‍🧒‍🧒',
   ai: '✨',
   downloader: '📥',
   group: '👥',
   maker: '🎨',
   owner: '👑',
   partner: '🎖️',
   'sound effect': '🔈',
   tools: '⚒️',
   'user info': '👤',
   other: '💭'
}

export const EMPTY_PARSED = Object.freeze({
   prefix: '',
   command: '',
   text: '',
   args: []
})

export const FAKE_QUOTE = {
   key: {
      remoteJid: '0@s.whatsapp.net',
      fromMe: false,
      participant: '0@s.whatsapp.net'
   },
   message: {
      newsletterAdminInviteMessage: {
         newsletterJid: '1@newsletter',
         newsletterName: botName,
         caption: '𝖵𝖾𝗋𝗂𝖿𝗂𝖾𝖽 𝖶𝗁𝖺𝗍𝗌𝖠𝗉𝗉 𝖠𝗎𝗍𝗈𝗆𝖺𝗍𝗂𝗈𝗇',
         inviteExpiration: 0
      }
   }
}

export const MORSE = {
   a: '•–', b: '–•••', c: '–•–•',
   d: '–••', e: '•', f: '••–•',
   g: '––•', h: '••••', i: '••',
   j: '•–––', k: '–•–', l: '•–••',
   m: '––', n: '–•', o: '–––',
   p: '•––•', q: '––•–', r: '•–•',
   s: '•••', t: '–', u: '••–',
   v: '•••–', w: '•––', x: '–••–',
   y: '–•––', z: '––••', '1': '•––––',
   '2': '••–––', '3': '•••––', '4': '••••–',
   '5': '•••••', '6': '–••••', '7': '––•••',
   '8': '–––••', '9': '––––•', '0': '–––––'
}

export const FONT_VARIANTS = {
   0: '𝖺𝖻𝖼𝖽𝖾𝖿𝗀𝗁𝗂𝗃𝗄𝗅𝗆𝗇𝗈𝗉𝗊𝗋𝗌𝗍𝗎𝗏𝗐𝗑𝗒𝗓𝖠𝖡𝖢𝖣𝖤𝖥𝖦𝖧𝖨𝖩𝖪𝖫𝖬𝖭𝖮𝖯𝖰𝖱𝖲𝖳𝖴𝖵𝖶𝖷𝖸𝖹0123456789',
   1: '𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭0123456789',
   2: '𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉0123456789'
}

export const DE_MORSE = Object.fromEntries(Object.entries(MORSE).map(([k,v]) => [v, k]))

export const FONT_MAPS = Object.fromEntries(
   Object.entries(FONT_VARIANTS).map(([name, variant]) => {
      const variantChars = Array.from(variant)
      const sourceChars = Array.from(FONT_SOURCE)

      return [
         name,
         Object.fromEntries(
            sourceChars.map((c, i) => [c, variantChars[i]])
         )
      ]
   })
)

export const WEBP_EXIF_HEADER = Buffer.from([
   0x49, 0x49, 0x2A,
   0x00, 0x08, 0x00,
   0x00, 0x00, 0x01,
   0x00, 0x41, 0x57,
   0x07, 0x00, 0x00,
   0x00, 0x00, 0x00,
   0x16, 0x00, 0x00,
   0x00
])

export const IMAGE_TO_WEBP = [
   '-an', '-sn',
   '-vf', 'scale=512:512:force_original_aspect_ratio=decrease:flags=fast_bilinear,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000',
   '-c:v', 'libwebp',
   '-q:v', '80',
   '-lossless', '0',
   '-method', '0',
   '-frames:v', '1',
   '-compression_level', '0',
   '-map_metadata', '-1',
   '-preset', 'picture',
   '-pix_fmt', 'yuva420p',
   '-f', 'webp'
]

export const VIDEO_TO_WEBP = [
   '-ss', '00:00:00',
   '-t', '00:00:05',
   '-an', '-sn',
   '-vf', 'scale=512:512:force_original_aspect_ratio=decrease:flags=fast_bilinear,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,fps=10',
   '-c:v', 'libwebp',
   '-q:v', '60',
   '-lossless', '0',
   '-method', '0',
   '-compression_level', '0',
   '-map_metadata', '-1',
   '-preset', 'picture',
   '-pix_fmt', 'yuva420p',
   '-f', 'webp'
]

export const AUDIO_TO_MPEG = [
   '-vn',
   '-c:a', 'libmp3lame',
   '-q:a', '5',
   '-ar', '44100',
   '-ac', '2',
   '-compression_level', '0',
   '-f', 'mp3'
]

export const AUDIO_TO_OPUS = [
   '-vn',
   '-c:a', 'libopus',
   '-b:a', '32k',
   '-ar', '48000',
   '-ac', '1',
   '-vbr', 'on',
   '-compression_level', '0',
   '-map_metadata', '-1',
   '-f', 'ogg'
]

export const JPG_CONVERSION_ARGS = [
   '-vf', 'select=eq(n\\,0)',
   '-vsync', 'vfr',
   '-map_metadata', '-1',
   '-q:v', '3',
   '-c:v', 'mjpeg',
   '-pix_fmt', 'yuv420p',
   '-color_range', 'pc'
]

export const BRAT_GIF_ARGS = [
   '-an', '-sn',
   '-vf', 'scale=512:512:force_original_aspect_ratio=decrease:flags=fast_bilinear,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,split[s0][s1];[s0]palettegen=max_colors=32:stats_mode=full[p];[s1][p]paletteuse=dither=none,fps=6',
   '-f', 'gif'
]

export const FFMPEG_CONCAT_ARGS = [
   '-f', 'concat',
   '-safe', '0'
]

export const SCHEMA = {
   User: {
      jid: null,
      lid: null,
      name: null,
      banned: false,
      afkReason: '',
      afkContext: {},
      afkTimestamp: -1,
      limit: defaultLimit,
      commandUsage: 0,
      callAttempt: 0,
      lastClaim: 0,
      lastSeen: 0
   },
   Group: {
      id: null,
      name: null,
      left: true,
      welcome: true,
      mute: false,
      adminOnly: false,
      antiBot: false,
      antiDelete: false,
      antiPorn: false,
      antiSpam: true,
      antiWALink: false,
      antiLink: false,
      antiRejoin: true,
      antiTagAll: false,
      antiToxic: true,
      antiGroupStatus: false,
      antiTagStatus: false,
      autoSticker: false,
      sholatReminder: false,
      viewOnceForwarder: false,
      leftMessage: '',
      welcomeMessage: '',
      participants: {},
      lastActivity: 0
   },
   Setting: {
      partner: [],
      prefixes: ['.', '/', '!', '#', '🌱'],
      forbiddenWords: ['ajg', 'ajig', 'anjas', 'anjg', 'anjim', 'anjrot', 'anying', 'autis', 'bacod', 'bacot', 'bagong', 'bajingan', 'bangsad', 'bangsat', 'bastard', 'bego', 'bgsd', 'biadab', 'biadap', 'bitch', 'bngst', 'bodoh', 'bokep', 'cocote', 'coli', 'colmek', 'comli', 'dajjal', 'dancok', 'dongo', 'fuck', 'gelay', 'goblog', 'goblok', 'guoblog', 'guoblok', 'henceut', 'idiot', 'itil', 'jamet', 'jancok', 'jembut', 'jingan', 'kafir', 'kanjut', 'kanyut', 'keparat', 'kntl', 'kontol', 'loli', 'lont', 'lonte', 'meki', 'memek', 'ngentod', 'ngentot', 'ngewe', 'ngocok', 'ngtd', 'njeng', 'njing', 'njinx', 'oppai', 'pantek', 'pantek', 'peler', 'pepek', 'pilat', 'pler', 'pornhub', 'pucek', 'puki', 'pukimak', 'redhub', 'sange', 'setan', 'silit', 'telaso', 'tempek', 'tete', 'titit', 'tobrut', 'toket', 'tolol', 'tomlol', 'tytyd', 'xnxx'],
      disabledCommand: [],
      stickerCommand: {},
      self: false,
      autoDownload: true,
      commandSuggestions: true,
      noPrefix: false,
      groupOnly: true,
      onlineStatus: true,
      rejectCall: true,
      slowMode: false,
      newsletterId: '',
      broadcastCooldown: 10000,
      menuStyle: 3,
      messageIngress: 0,
      messageEgress: 0,
      byteIngress: 0,
      byteEgress: 0,
      lastReset: 0
   },
   Participant: {
      leftGroup: false,
      messages: 0,
      warningPoint: 0,
      lastSeen: 0
   }
}