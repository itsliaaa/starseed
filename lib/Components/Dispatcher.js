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

import { Agent, setGlobalDispatcher } from 'undici'
import dns from 'dns'
import http from 'http'
import https from 'https'
import net from 'net'

const DNSCache = new Map()
const DNS_CACHE_TTL = 1000 * 60 * 5

const customLookup = (hostname, options, callback) => {
   const family = typeof options === 'object' ? options.family : options
   const isAll = typeof options === 'object' && options.all === true

   const isIP = net.isIP(hostname)
   if (isIP != 0) {
      if (isAll)
         return process.nextTick(() => callback(null, [{ address: hostname, family: isIP }]))
      return process.nextTick(() => callback(null, hostname, isIP))
   }

   const keyCache = hostname + '_' + family + '_' + isAll

   if (DNSCache.has(keyCache)) {
      const cachedRecord = DNSCache.get(keyCache)
      if (Date.now() < cachedRecord.expiresAt)
         return process.nextTick(() => {
            if (isAll)
               callback(null, cachedRecord.addresses)
            else
               callback(null, cachedRecord.addresses[0].address, cachedRecord.addresses[0].family)
         })
      DNSCache.delete(keyCache)
   }

   const saveAndCallback = (ipArray, familyType) => {
      const formattedAddresses = ipArray.map(ip => ({ address: ip, family: familyType }))

      DNSCache.set(keyCache, {
         addresses: formattedAddresses,
         expiresAt: Date.now() + DNS_CACHE_TTL
      })

      if (isAll)
         callback(null, formattedAddresses)
      else
         callback(null, formattedAddresses[0].address, formattedAddresses[0].family)
   }

   const createNotFoundError = () => {
      const error = new Error('getaddrinfo ENOTFOUND ' + hostname)
      error.code = 'ENOTFOUND'
      return error
   }

   if (family === 6) {
      dns.resolve6(hostname, (error, addresses) => {
         if (error || !addresses || addresses.length === 0)
            return callback(error || createNotFoundError())
         saveAndCallback(addresses, 6)
      })
      return
   }

   dns.resolve4(hostname, (error, addresses) => {
      if (error || !addresses || addresses.length === 0) {
         if (family === 4)
            return callback(error || createNotFoundError())
         return dns.resolve6(hostname, (error6, addresses6) => {
            if (error6 || !addresses6 || addresses6.length === 0)
               return callback(error || error6 || createNotFoundError())
            saveAndCallback(addresses6, 6)
         })
      }
      saveAndCallback(addresses, 4)
   })
}

dns.setServers(['1.1.1.1', '1.0.0.1'])

http.globalAgent = new http.Agent({
   lookup: customLookup,
   keepAlive: true
})

https.globalAgent = new https.Agent({
   lookup: customLookup,
   keepAlive: true
})

setGlobalDispatcher(
   new Agent({
      connections: 5,
      pipelining: 1,
      keepAliveTimeout: 4000,
      keepAliveMaxTimeout: 1000 * 60,
      connectTimeout: 10000,
      bodyTimeout: 1000 * 60,
      maxRedirections: 3,
      connect: {
         lookup: customLookup
      }
   })
)