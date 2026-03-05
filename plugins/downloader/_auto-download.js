import { nekolabs, nexray } from '../../lib/Request.js'
import { instagram, tiktok } from '../../lib/Scraper.js'
import { isURL } from '../../lib/Utilities.js'

const URL_REGEX = /https?:\/\/[^\s]+?(?=[\s]|$)/

export default {
   async run(m, {
      sock,
      user,
      setting,
      isPartner,
      body
   }) {
      if (!setting.autoDownload || !isURL(body)) return
      if (!isPartner) {
         if (user.limit > 0)
            user.limit -= 1
         else
            return m.reply(`⚠️ Your limit is not enough to use auto download, try \`${setting.prefixes[0]}claim\` command to claim limit.`)
      }
      URL_REGEX.lastIndex = 0
      const match = URL_REGEX.exec(body)
      if (!match?.[0]) return
      const url = match[0]
      try {
         if (url.includes('capcut.com')) {
            m.react('🕒')
            const data = await nexray('downloader/capcut', {
               url
            })
            if (!data.status)
               return m.reply('❌ Failed to get data.')
            sock.sendMedia(m.chat, data.result.url, data.result.title, m)
         }
         else if (url.includes('facebook.')) {
            m.react('🕒')
            const data = await nexray('downloader/facebook', {
               url
            })
            if (!data.status)
               return m.reply('❌ Failed to get data.')
            sock.sendMedia(m.chat, data.result.video_hd || data.result.video_sd, '', m)
         }
         else if (url.includes('drive.google')) {
            m.react('🕒')
            const data = await nexray('downloader/googledrive', {
               url
            })
            if (!data.status)
               return m.reply('❌ Failed to get data.')
            sock.sendMedia(m.chat, data.result.url, data.result.name, m)
         }
         else if (url.includes('instagram.')) {
            m.react('🕒')
            const data = await instagram(url)
            if (!data.media.length)
               return m.reply('❌ Failed to get data.')
            if (data.media.length <= 2)
               return sock.sendMedia(m.chat, data.media[0].url, '', m)
            sock.sendMessage(m.chat, {
               album: data.media.map(media => {
                  if (media.type === 'audio') return
                  return ({
                     [media.type]: {
                        url: media.url
                     }
                  })
               })
                  .filter(Boolean)
            }, {
               quoted: m
            })
         }
         else if (url.includes('mediafire.com')) {
            m.react('🕒')
            const data = await nexray('downloader/mediafire', {
               url
            })
            if (!data.status)
               return m.reply('❌ Failed to get data.')
            sock.sendMedia(m.chat, data.result.download_url, '', m, {
               document: true
            })
         }
         else if (url.includes('pin.it')) {
            m.react('🕒')
            const data = await nekolabs('downloader/pinterest', {
               url
            })
            if (!data.success)
               return m.reply('❌ Failed to get data.')
            sock.sendMedia(m.chat, data.result.medias.at(-1).url, '', m)
         }
         else if (url.includes('open.spotify.com')) {
            m.react('🕒')
            const data = await nexray('downloader/spotify', {
               url
            })
            if (!data.status)
               return m.reply('❌ Failed to get data.')
            sock.sendMedia(m.chat, data.result.url, '', m, {
               audio: true
            })
         }
         else if (url.includes('tiktok.com')) {
            m.react('🕒')
            const data = await tiktok(url)
            if (!data.media.length)
               return m.reply('❌ Failed to get data.')
            const videoContent = data.media.find(video => video.type === 'hd' || video.type === 'mp4')
            const imageContent = data.media.filter(image => image.type === 'image')
            if (imageContent.length > 1)
               return sock.sendMessage(m.chat, {
                  album: imageContent.map(image => ({
                     image: {
                        url: image.url
                     }
                  }))
               }, {
                  quoted: m
               })
            sock.sendMedia(m.chat, imageContent[0]?.url || videoContent?.url, data.title, m)
         }
         else if (url.includes('videy.co')) {
            m.react('🕒')
            const data = await nexray('downloader/videy', {
               url
            })
            if (!data.status)
               return m.reply('❌ Failed to get data.')
            sock.sendMedia(m.chat, data.result, '', m)
         }
         else if (url.includes('youtube.')) {
            m.react('🕒')
            const data = await nexray('downloader/v1/ytmp4', {
               url
            })
            if (!data.status)
               return m.reply('❌ Failed to get data.')
            sock.sendMedia(m.chat, data.result.url, data.result.title, m)
         }
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   }
}