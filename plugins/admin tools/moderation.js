const MODERATION_MAPS = {
   adminonly: 'adminOnly',
   antibot: 'antiBot',
   antidelete: 'antiDelete',
   antiporn: 'antiPorn',
   antigroupstatus: 'antiGroupStatus',
   antilink: 'antiLink',
   antirejoin: 'antiRejoin',
   antispam: 'antiSpam',
   antitagall: 'antiTagAll',
   antitagstatus: 'antiTagStatus',
   antitoxic: 'antiToxic',
   antiwalink: 'antiWALink',
   autosticker: 'autoSticker',
   labelupdate: 'memberLabelUpdate',
   sholatreminder: 'sholatReminder',
   viewonce: 'viewOnceForwarder'
}

const PRETTY_MODERATION_MAPS = {
   adminonly: 'Admin Only',
   antibot: 'Anti Bot',
   antidelete: 'Anti Delete',
   antiporn: 'Anti Porn',
   antigroupstatus: 'Anti Group Status',
   antilink: 'Anti Link',
   antirejoin: 'Anti Rejoin',
   antispam: 'Anti Spam',
   antitagall: 'Anti Tag All',
   antitagstatus: 'Anti Tag Status',
   antiwalink: 'Anti WhatsApp Link',
   antitoxic: 'Anti Toxic',
   autosticker: 'Auto Sticker',
   labelupdate: 'Member Label Update',
   sholatreminder: 'Sholat Reminder',
   viewonce: 'View Once Forwarder',
   welcome: 'Welcome Message',
   left: 'Left Message'
}

const BOT_ADMIN_COMMANDS = [
   'antibot',
   'antiporn',
   'antigroupstatus',
   'antilink',
   'antirejoin',
   'antispam',
   'antitagall',
   'antitagstatus',
   'antiwalink',
   'antitoxic'
]

export default {
   command: ['adminonly', 'antibot', 'antidelete', 'antiporn', 'antigroupstatus', 'antilink', 'antirejoin', 'antispam', 'antitagall', 'antitagstatus', 'antitoxic', 'antiwalink', 'autosticker', 'labelupdate', 'sholatreminder', 'left', 'welcome'],
   category: 'admin tools',
   async run(m, {
      group,
      isBotAdmin,
      isPrefix,
      command,
      args
   }) {
      const [option] = args
      if (!option)
         return m.reply(`👉🏻 *Example*: ${isPrefix + command} on`)
      if (option !== 'on' && option !== 'off')
         return m.reply(`👉🏻 *Example*: ${isPrefix + command} on`)
      if (BOT_ADMIN_COMMANDS.includes(command) && !isBotAdmin)
         return m.reply('⚠️ This command will work when bot become an admin.')
      if (command === 'antiporn' && (!apiUser || !apiSecret))
         return m.reply('❌ The Anti Porn feature is currently unavailable. Please ask the bot owner to set it up first.')
      const isActivating = option === 'on'
      const keySetting = MODERATION_MAPS[command] || command
      const prettyKeyName = PRETTY_MODERATION_MAPS[command]
      let print = isActivating ?
         `❌ ${prettyKeyName} already activated.` :
         `❌ ${prettyKeyName} already deactivated.`
      if (group[keySetting] === isActivating)
         return m.reply(print)
      group[keySetting] = isActivating
      print = isActivating ?
         `✅ Successfully activating ${prettyKeyName}.` :
         `✅ Successfully deactivating ${prettyKeyName}.`
      m.reply(print)
   },
   group: true,
   admin: true
}