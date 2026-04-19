import { delay } from '@itsliaaa/baileys'
import { exec, spawn } from 'child_process'
import { format, promisify } from 'util'
import vm from 'vm'

const execAsync = promisify(exec)

export default {
   async run(m, context) {
      const { body, isOwner, sock } = context
      if (typeof body !== 'string' || !isOwner) return
      const trimmedBody = body.trim()
      const firstSpaceIndex = trimmedBody.indexOf(' ')
      if (firstSpaceIndex === -1) return
      const command = trimmedBody.slice(0, firstSpaceIndex)
      const code = trimmedBody
         .slice(firstSpaceIndex + 1)
         .trim()
      const validCommands = ['>', '=>', '~', '~>', '$', '%']
      if (!validCommands.includes(command) || !code) return
      try {
         if (['>', '=>', '~', '~>'].includes(command)) {
            const isReturn = command === '=>' || command === '~>'
            const isSafe = command === '~' || command === '~>'
            const iife = `(async () => { ${isReturn ? 'return ' : ''}${code} })()`
            let evaluate
            if (isSafe)
               evaluate = await safeEval(iife, { ...context, m })
            else
               evaluate = await eval(iife)
            const formatEval = format(evaluate)
            const isFalsyString = formatEval === 'null' ||
               formatEval === 'undefined' ||
               formatEval === 'false'
            if (!isFalsyString)
               await m.reply(formatEval)
         }
         else if (command === '$') {
            await m.react('🕒')
            const rawArgs = code.split(' ')
            const args = []
            for (let i = 0; i < rawArgs.length; i++)
               if (rawArgs[i].trim() !== '')
                  args.push(rawArgs[i].trim())
            const cmd = args.shift()
            const proc = spawn(cmd, args)
            let stdoutData = ''
            let stderrData = ''
            proc.stdout.on('data', (data) => stdoutData += data.toString())
            proc.stderr.on('data', (data) => stderrData += data.toString())
            proc.on('close', async (exitCode) => {
               let result = ''
               if (stdoutData)
                  result += `[STDOUT]:\n${stdoutData.trim()}\n\n`
               if (stderrData)
                  result += `[STDERR]:\n${stderrData.trim()}\n\n`
               if (!result)
                  result = `Process exited with code ${exitCode}`
               if (result.length > 50000)
                  result = result.substring(0, 50000) + '\n\n...[Output Trimmed]'
               await m.reply(result.trim())
            })
            proc.on('error', async (error) => {
               await m.reply(`❌ Unexpected error occurred: ${error.message}`)
            })
         }
         else if (command === '%') {
            await m.react('🕒')
            const { stdout, stderr } = await execAsync(code, { 
               maxBuffer: 1024 * 1024, 
               timeout: 60000 
            })
            let output = ''
            if (stderr)
               output += `[STDERR]:\n${stderr.toString().trim()}\n\n`
            if (stdout)
               output += `[STDOUT]:\n${stdout.toString().trim()}`
            if (output)
               await m.reply(output.trim())
         }
      }
      catch (error) {
         await m.reply('```\n' + format(error) + '\n```')
      }
   },
   owner: true
}

const safeEval = async (code, extraContext = {}) => {
   const sandbox = {
      console: { log: () => {} },
      ...extraContext,
      process: undefined,
      global: undefined,
      globalThis: undefined,
      this: undefined,
      constructor: undefined
   }

   sandbox.eval = () => { throw new Error('eval is disabled in safe mode') }
   sandbox.Function = () => { throw new Error('Function constructor is disabled in safe mode') }
   sandbox.require = () => { throw new Error('require is disabled in safe mode') }

   Object.freeze(sandbox)
   const context = vm.createContext(sandbox)
   const script = new vm.Script(code)

   try {
      const result = await script.runInContext(context, { timeout: 3000 })
      return result
   }
   catch (error) {
      return '❌ ' + error.message
   }
}