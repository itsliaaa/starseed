import { hostname, cpus, totalmem, freemem, platform, arch, release, uptime } from 'os'

import { SECOND } from '../../lib/Constants.js'
import { fetchThumbnail, formatNumber, formatSize, formatTime, frame, getDiskStats, greeting, toTime } from '../../lib/Utilities.js'

const getPingEmojis = (ms) => {
   if (ms < 30) return '🚀'
   if (ms < 150) return '🚗'
   if (ms < 1000) return '🚚'
   return '🐌'
}

export default {
   command: ['ping', 'ram', 'server', 'statistic'],
   category: 'other',
   async run (m, {
      setting,
      command
   }) {
      if (command === 'ping') {
         const old = performance.now()
         await m.react('🚀')
         const ping = (performance.now() - old) | 0
         m.reply(
            getPingEmojis(ping) +
            ' *Latency*: ' +
            ping +
            'ms'
         )
      }
      else if (command === 'ram')
         m.reply('💾 *RAM Usage*: ' + formatSize(process.memoryUsage().rss) + ' / ' + formatSize(totalmem()))
      else if (command === 'server') {
         const cpu = cpus()
         const totalMemory = totalmem()
         const freeMemory = freemem()
         const memoryUsage = process.memoryUsage()
         const diskUsage = await getDiskStats()
         const printServer = frame('SERVER', [
            `*OS*: ${platform}`,
            `*Arch*: ${arch}`,
            `*Release*: ${release}`,
            `*Uptime*: ${toTime(uptime * SECOND)}`
         ], '🗄️')
         const printSystem = frame('SYSTEM', [
            `*CPU Model*: ${cpu[0]?.model || '-'}`,
            `*CPU Speed*: ${cpu[0]?.speed || '-'}`,
            `*CPU Count*: ${cpu.length || '-'}`,
            `*RAM Used*: ${formatSize(totalMemory - freeMemory)} / ${formatSize(totalMemory)}`,
            `*Disk Used*: ${formatSize(diskUsage.used)} / ${formatSize(diskUsage.total)}`
         ], '💾')
         const printProcess = frame('PROCESS', [
            `*Node.js*: ${process.version}`,
            `*V8*: ${process.versions.v8}`,
            `*Heap Used*: ${formatSize(memoryUsage.heapUsed)} / ${formatSize(memoryUsage.heapTotal)}`,
            `*RSS*: ${formatSize(memoryUsage.rss)}`,
            `*External*: ${formatSize(memoryUsage.external)}`,
            `*Runtime*: ${toTime(process.uptime() * SECOND)}`
         ], '🔃')
         m.reply(
            printServer +
            '\n\n' + printSystem +
            '\n\n' + printProcess
         , {
            externalAdReply: {
               title: botName,
               body: greeting(),
               thumbnail: await fetchThumbnail(),
               largeThumbnail: true
            }
         })
      }
      else if (command === 'statistic') {
         const printStatistic = frame('STATISTIC', [
            `*Message Sent*: ${formatNumber(setting.messageEgress)}`,
            `*Message Received*: ${formatNumber(setting.messageIngress)}`,
            `*Media Sent*: ${formatSize(setting.byteEgress)}`,
            `*Media Received*: ${formatSize(setting.byteIngress)}`
         ], '📊')
         const printSettings = frame('SETTINGS', [
            `*Mode*: ${setting.self ? '🔒 Self' : '🌐 Public'}`,
            `*AFK Notifier*: ${setting.afkNotifier ? '✅' : '❌'}`,
            `*Auto Download*: ${setting.autoDownload ? '✅' : '❌'}`,
            `*Command Suggestions*: ${setting.commandSuggestions ? '✅' : '❌'}`,
            `*Group Only*: ${setting.groupOnly ? '✅' : '❌'}`,
            `*No Prefix*: ${setting.noPrefix ? '✅' : '❌'}`,
            `*Online Status*: ${setting.onlineStatus ? '✅' : '❌'}`,
            `*Reject Call*: ${setting.rejectCall ? '✅' : '❌'}`,
            `*Slow Mode*: ${setting.slowMode ? '✅' : '❌'}`,
            `*Prefixes*: [${setting.prefixes}]`,
            `*Last Reset*: ${formatTime('YYYY/MM/DD HH:mm:ss', setting.lastReset)}`
         ], '⚙️')
         m.reply(
            printStatistic +
            '\n\n' + printSettings
         , {
            externalAdReply: {
               title: botName,
               body: greeting(),
               thumbnail: await fetchThumbnail(),
               largeThumbnail: true
            }
         })
      }
   }
}