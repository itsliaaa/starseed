import { zenzxz } from '../../lib/Request.js'
import { fetchAsBuffer, formatNumber, formatTime, frame } from '../../lib/Utilities.js'

export default {
   command: ['dcstalk', 'ffstalk', 'igstalk', 'robloxstalk', 'ttstalk'],
   category: 'tools',
   async run(m, {
      isPrefix,
      command,
      args
   }) {
      try {
         if (command === 'dcstalk') {
            if (!args[0])
               return m.reply(`👉🏻 *Example*: ${isPrefix + command} 1355400581027729428`)
            m.react('🕒')
            const data = await zenzxz('stalker/discord', {
               id: args[0]
            })
            if (!data.status)
               return m.reply('❌ Failed to get data.')
            const printInfo = frame('DISCORD STALK', [
               `*Global Name*: ${data.result.global_name}`,
               `*Display Name*: ${data.result.display_name}`,
               `*Banner Color*: ${data.result.banner_color}`,
               `*Created At*: ${data.result.created}`
            ], '🗒️')
            m.reply(printInfo, {
               externalAdReply: {
                  title: data.result.display_name,
                  body: data.result.global_name,
                  thumbnail: await fetchAsBuffer(data.result.avatar || botThumbnail),
                  largeThumbnail: true
               }
            })
         }
         else if (command === 'ffstalk') {
            if (!args[0])
               return m.reply(`👉🏻 *Example*: ${isPrefix + command} 16207002`)
            m.react('🕒')
            const data = await zenzxz('stalker/ffstalk', {
               id: args[0]
            })
            if (!data.status)
               return m.reply('❌ Failed to get data.')
            const printInfo = frame('FREE FIRE STALK', [
               `*Nickname*: ${data.result.basicinfo.nickname}`,
               `*Region*: ${data.result.basicinfo.region}`,
               `*Level*: ${data.result.basicinfo.level} (${data.result.basicinfo.exp} EXP)`,
               `*Liked*: ${data.result.basicinfo.liked}`,
               `*Last Login*: ${formatTime(undefined, Number(data.result.basicinfo.lastloginat) * 1000)}`,
               `*Created At*: ${formatTime(undefined, Number(data.result.basicinfo.createat) * 1000)}`
            ], '🗒️')
            const printClan = frame('CLAN INFO', [
               `*Clan Id*: ${data.result.clanbasicinfo.clanid}`,
               `*Clan Name*: ${data.result.clanbasicinfo.clanname}`,
               `*Captain Id*: ${data.result.clanbasicinfo.captainid}`,
               `*Clan Level*: ${data.result.clanbasicinfo.clanlevel}`,
               `*Member Capacity*: ${data.result.clanbasicinfo.capacity}`,
               `*Member*: ${data.result.clanbasicinfo.membernum}`,
               `*Honor Point*: ${data.result.clanbasicinfo.honorpoint}`
            ], '👥')
            m.reply(printInfo + '\n\n' +
               printClan)
         }
         else if (command === 'igstalk') {
            if (!args[0])
               return m.reply(`👉🏻 *Example*: ${isPrefix + command} instagram`)
            m.react('🕒')
            const data = await zenzxz('stalker/instagram', {
               username: args[0]
            })
            if (!data.status)
               return m.reply('❌ Failed to get data.')
            const printInfo = frame('INSTAGRAM STALK', [
               `*Username*: @${data.result.username}`,
               `*Name*: ${data.result.name}`,
               `*Verified*: ${data.result.verified ? '✅' : '❌'}`
            ], '🗒️')
            const printStatistic = frame('STATISTIC', [
               `*Followers*: ${formatNumber(data.result.followers)}`,
               `*Following*: ${formatNumber(data.result.following)}`,
               `*Posts*: ${formatNumber(data.result.posts)}`
            ], '📈')
            const printBio = frame('BIO', [
               `${data.result.bio}`
            ], '💭')
            m.reply(printInfo + '\n\n' +
               printStatistic + '\n\n' +
               printBio, {
               externalAdReply: {
                  title: data.result.name,
                  body: '@' + data.result.username,
                  thumbnail: await fetchAsBuffer(data.result.profile_pic || botThumbnail),
                  largeThumbnail: true
               }
            })
         }
         else if (command === 'robloxstalk') {
            if (!args[0])
               return m.reply(`👉🏻 *Example*: ${isPrefix + command} builderman`)
            m.react('🕒')
            const data = await zenzxz('stalker/roblox', {
               user: args[0]
            })
            if (!data.status)
               return m.reply('❌ Failed to get data.')
            const printInfo = frame('ROBLOX STALK', [
               `*Name*: ${data.result.basic.name}`,
               `*Display Name*: ${data.result.basic.displayName}`,
               `*Is Banned*: ${data.result.basic.isBanned ? '✅' : '❌'}`,
               `*Verified Badge*: ${data.result.basic.hasVerifiedBadge ? '✅' : '❌'}`,
               `*Created At*: ${formatTime(undefined, Date.parse(data.result.basic.created))}`
            ], '🗒️')
            const printSocial = frame('SOCIAL', [
               `*Friends*: ${formatNumber(data.result.social.friends?.count || 0)}`,
               `*Followers*: ${formatNumber(data.result.social.followers?.count || 0)}`,
               `*Following*: ${formatNumber(data.result.social.following?.count || 0)}`
            ], '💬')
            m.reply(printInfo + '\n\n' +
               printSocial)
         }
         else if (command === 'ttstalk') {
            if (!args[0])
               return m.reply(`👉🏻 *Example*: ${isPrefix + command} khaby.lame`)
            m.react('🕒')
            const data = await zenzxz('stalker/tiktok', {
               username: args[0]
            })
            if (!data.status)
               return m.reply('❌ Failed to get data.')
            const printInfo = frame('TIKTOK STALK', [
               `*Nickname*: ${data.result.nickname}`,
               `*Username*: @${data.result.username}`,
               `*Is Verified*: ${data.result.is_verified ? '✅' : '❌'}`
            ], '🗒️')
            const printStatistic = frame('STATISTIC', [
               `*Followers*: ${formatNumber(data.result.stats.followers || 0)}`,
               `*Following*: ${formatNumber(data.result.stats.following || 0)}`,
               `*Likes*: ${formatNumber(data.result.stats.heart || 0)}`,
               `*Videos*: ${formatNumber(data.result.stats.video || 0)}`,
               `*Friends*: ${formatNumber(data.result.stats.friend || 0)}`
            ], '📈')
            const printBio = frame('BIO', [
               ...data.result.bio.split('\\n')
            ], '💭')
            m.reply(printInfo + '\n\n' +
               printStatistic + '\n\n' +
               printBio, {
               externalAdReply: {
                  title: data.result.nickname,
                  body: '@' + data.result.username,
                  thumbnail: await fetchAsBuffer(data.result.avatar || botThumbnail),
                  largeThumbnail: true
               }
            })
         }
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   premium: true,
   limit: 1
}