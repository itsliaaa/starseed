module.exports = {
   apps: [{
      name: 'bot',
      script: './index.js',
      stop_exit_codes: [0],
      node_args: [
         '--max-old-space-size=300',
         '--expose-gc'
      ],
      env: {
         NODE_ENV: 'production',
         MALLOC_ARENA_MAX: '2'
      }
   }]
}