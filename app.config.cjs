module.exports = {
   apps: [{
      name: 'bot',
      script: './index.js',
      node_args: ['--max-old-space-size=256'],
      stop_exit_codes: [0],
      env: {
         NODE_ENV: 'production'
      }
   }]
}