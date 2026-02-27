import { ffmpeg, isMimeAudio, persistToFile } from '../../lib/Utilities.js'

export default {
   command: ['bass', 'blown', 'chipmunk', 'deep', 'earrape', 'fast', 'fat', 'nightcore', 'reverse', 'robot', 'slow', 'smooth', 'vibrato', 'echo', 'tremolo', 'cave', 'haunted', 'underwater', 'cursed', 'dizzy', 'demonic', 'alien', 'ghost', 'glitch', 'vintage', 'telephone', '8d', 'drunk', 'helium', 'muted', 'underworld', 'squirrel', 'boostbass', 'boosttreble', 'whisper', 'darthvader', 'chipdemon', 'megaphone', 'immersive', 'reverb'],
   category: 'sound effect',
   async run(m, {
      sock,
      command
   }) {
      try {
         const q = m.quoted?.url ? m.quoted : m
         if (!q.mimetype && !isMimeAudio(q.mimetype))
            return m.reply(`💭 Provide an audio to add the effects.`)
         m.react('🕒')
         let set
         switch (command) {
            case 'bass':
               set = '-af equalizer=f=94:width_type=o:width=2:g=30'
               break
            case 'blown':
               set = '-af acrusher=.1:1:64:0:log'
               break
            case 'deep':
               set = '-af atempo=4/4,asetrate=44500*2/3'
               break
            case 'earrape':
               set = '-af volume=12'
               break
            case 'fast':
               set = '-filter:a atempo=1.63,asetrate=44100'
               break
            case 'fat':
               set = '-filter:a atempo=1.6,asetrate=22100'
               break
            case 'nightcore':
               set = '-filter:a atempo=1.06,asetrate=44100*1.25'
               break
            case 'reverse':
               set = '-filter_complex areverse'
               break
            case 'robot':
               set = "-filter_complex afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)':win_size=512:overlap=0.75"
               break
            case 'slow':
               set = '-filter:a atempo=0.7,asetrate=44100'
               break
            case 'smooth':
               set = '-filter:a lowpass=f=3000,highpass=f=200'
               break
            case 'chipmunk':
               set = '-filter:a atempo=0.5,asetrate=65100'
               break
            case 'vibrato':
               set = '-af vibrato=f=5.0'
               break
            case 'echo':
               set = '-af aecho=0.8:0.9:1000:0.3'
               break
            case 'tremolo':
               set = '-af tremolo=f=5.0:d=0.7'
               break
            case 'cave':
               set = '-af aecho=0.8:0.88:60:0.4'
               break
            case 'haunted':
               set = '-af aecho=0.9:0.9:1000:0.6,asetrate=22050'
               break
            case 'underwater':
               set = '-af aecho=0.6:0.3:1000:0.5,lowpass=f=300'
               break
            case 'cursed':
               set = '-af aecho=0.8:0.9:1000:0.4,asetrate=16000,atempo=0.8'
               break
            case 'dizzy':
               set = '-af apulsator=hz=0.3'
               break
            case 'demonic':
               set = '-af asetrate=44100*0.7,atempo=1.1'
               break
            case 'alien':
               set = "-af afftfilt=real='hypot(re,im)':imag='0':win_size=512:overlap=0.75"
               break
            case 'ghost':
               set = '-af aecho=0.9:0.7:500:0.6'
               break
            case 'glitch':
               set = '-af acrusher=8:0.5:3:0.6:0.1'
               break
            case 'vintage':
               set = '-af highpass=f=200,lowpass=f=3000'
               break
            case 'telephone':
               set = '-af bandpass=f=1000:width_type=h:width=200'
               break
            case '8d':
               set = '-af apulsator=hz=0.125'
               break
            case 'drunk':
               set = '-af asetrate=44100*0.9,atempo=0.9'
               break
            case 'helium':
               set = '-af asetrate=88000,atempo=1.5'
               break
            case 'muted':
               set = '-af volume=0.1'
               break
            case 'underworld':
               set = '-af asetrate=22050,atempo=0.75,bass=g=10'
               break
            case 'squirrel':
               set = '-af atempo=1.8,asetrate=88200'
               break
            case 'boostbass':
               set = '-af equalizer=f=40:width_type=h:width=50:g=10'
               break
            case 'boosttreble':
               set = '-af equalizer=f=10000:width_type=h:width=2000:g=8'
               break
            case 'immersive':
               set = '-af stereotools=mlev=1.7,volume=1.15,acompressor=level_in=1:threshold=0.4:ratio=2.5:attack=15:release=200,aecho=0.8:0.88:950|1250:0.3|0.25'
               break
            case 'whisper':
               set = '-af lowpass=f=1000,volume=0.5'
               break
            case 'darthvader':
               set = '-af asetrate=44100*0.7,atempo=1.2,volume=1.2'
               break
            case 'chipdemon':
               set = "-af asetrate=65100,volume=1.5,afftfilt=real='hypot(re,im)*cos(0)':imag='hypot(re,im)*sin(0)'"
               break
            case 'megaphone':
               set = '-af highpass=f=1000, lowpass=f=3000,volume=1.5'
               break
            case 'reverb':
               set = '-af aecho=0.6:0.5:60|120:0.4|0.3'
               break
         }
         const buffer = await q.download()
         if (!Buffer.isBuffer(buffer))
            return m.reply('❌ Failed to download media.')
         const filePath = await persistToFile(buffer)
         const audioPath = await ffmpeg(filePath, [], set.split(' '), 'mp3')
         sock.sendMedia(m.chat, audioPath, '', m, {
            ptt: true
         })
      }
      catch (error) {
         console.error(error)
         m.reply('❌ ' + error.message)
      }
   },
   limit: 1
}