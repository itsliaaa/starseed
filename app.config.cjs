module.exports = {
   apps: [{
      name: 'bot',
      script: './index.js',
      stop_exit_codes: [0],
      node_args: [
         '--expose-gc',
         '--max-old-space-size=256'
      ],
      env: {
         NODE_ENV: 'production',
         MALLOC_ARENA_MAX: '2'
      }
   }]
}