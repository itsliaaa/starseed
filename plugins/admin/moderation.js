const MODERATION_MAPS = {
   antidelete: 'antiDelete',
   antilink: 'antiLink',
   antispam: 'antiSpam',
   antitagstatus: 'antiTagStatus',
   antitoxic: 'antiToxic',
   antiwalink: 'antiWALink',
   autosticker: 'autoSticker'
}

const PRETTY_MODERATION_MAPS = {
   antidelete: 'Anti Delete',
   antilink: 'Anti Link',
   antispam: 'Anti Spam',
   antitagstatus: 'Anti Tag Status',
   antiwalink: 'Anti WhatsApp Link',
   antitoxic: 'Anti Toxic',
   autosticker: 'Auto Sticker',
   welcome: 'Welcome Message',
   left: 'Left Message'
}

export default {
   command: ['antidelete', 'antilink', 'antispam', 'antitagstatus', 'antitoxic', 'antiwalink', 'autosticker', 'left', 'welcome'],
   category: 'admin',
   async run(m, {
      group,
      isPrefix,
      command,
      args
   }) {
      const [option] = args
      if (!option)
         return m.reply(`👉🏻 *Example*: ${isPrefix + command} on`)
      if (option !== 'on' && option !== 'off')
         return m.reply(`👉🏻 *Example*: ${isPrefix + command} on`)
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
   admin: true,
   botAdmin: true
}