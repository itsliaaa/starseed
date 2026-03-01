const MODERATION_MAPS = {
   adminonly: 'adminOnly',
   antidelete: 'antiDelete',
   antilink: 'antiLink',
   antispam: 'antiSpam',
   antitagstatus: 'antiTagStatus',
   antitoxic: 'antiToxic',
   antiwalink: 'antiWALink',
   autosticker: 'autoSticker',
   sholatreminder: 'sholatReminder',
   viewonce: 'viewOnceForwarder'
}

const PRETTY_MODERATION_MAPS = {
   adminonly: 'Admin Only',
   antidelete: 'Anti Delete',
   antilink: 'Anti Link',
   antispam: 'Anti Spam',
   antitagstatus: 'Anti Tag Status',
   antiwalink: 'Anti WhatsApp Link',
   antitoxic: 'Anti Toxic',
   autosticker: 'Auto Sticker',
   sholatreminder: 'Sholat Reminder',
   viewonce: 'View Once Forwarder',
   welcome: 'Welcome Message',
   left: 'Left Message'
}

export default {
   command: ['adminonly', 'antidelete', 'antilink', 'antispam', 'antitagstatus', 'antitoxic', 'antiwalink', 'autosticker', 'sholatreminder', 'left', 'welcome'],
   category: 'admin tools',
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