import { frame, toArray } from '../../lib/Utilities.js'
import { ModuleCache } from '../../lib/Watcher.js'

const INNER_TEXT = 'There\'s affordable price\'s!'

const PREMIUM_PACKAGE = [
   ['Day(s)', 'Price'],
   ['1', 'Rp 2.500'],
   ['3', 'Rp 5.000'],
   ['7', 'Rp 10.000'],
   ['15', 'Rp 20.000'],
   ['30', 'Rp 25.000']
]

const RENTAL_PACKAGE = [
   ['Day(s)', 'Price'],
   ['7', 'Rp 10.000'],
   ['14', 'Rp 20.000'],
   ['28', 'Rp 25.000']
]

export default {
   command: ['premium', 'rental'],
   hidden: ['prem', 'rent'],
   category: 'other',
   async run(m, {
      sock,
      isPrefix,
      command
   }) {
      const isRentCommand = command === 'rental' || command === 'rent'
      const tableCommands = [{
         isHeading: true,
         items: ['Commands', 'Premium', 'Free']
      }]
      for (const { command, premium } of ModuleCache.values()) {
         if (!premium) continue
         const isPremium = premium ? '✅' : '❌'
         const isFree = premium ? '❌' : '✅'
         const commands = toArray(command)
         for (let i = 0; i < commands.length; i++)
            tableCommands.push({
               isHeading: false,
               items: [commands[i], isPremium, isFree]
            })
      }
      const richResponse = isRentCommand ?
         [{
            text: '# 🏡 RENTAL PRICING'
         }, {
            text: '---'
         }, {
            text: INNER_TEXT
         }, {
            title: '✨ Pricing',
            table: RENTAL_PACKAGE.map((items, index) => ({
               isHeading: index === 0,
               items
            }))
         }, {
            text: `If you want to buy please contact \`${isPrefix}owner\``
         }] :
         [{
            text: '# ✨ PREMIUM PRICING'
         }, {
            text: '---'
         }, {
            text: INNER_TEXT
         }, {
            title: '✨ Pricing',
            table: PREMIUM_PACKAGE.map((items, index) => ({
               isHeading: index === 0,
               items
            }))
         }, {
            text: '---\nYou can access all of theses premium commands after buying premium package:'
         }, {
            title: '📋 Premium Commands',
            table: tableCommands
         }, {
            text: `If you want to buy please contact \`${isPrefix}owner\``
         }]
      sock.sendMessage(m.chat, {
         richResponse
      }, {
         quoted: m
      })
   }
}