module.exports = {
   apps: [{
      name: 'bot',
      script: './index.js',
      exec_mode: 'fork',
      node_args: '--max-old-space-size=512',
      stop_exit_codes: [0],
      watch: false,
      env: {
         NODE_ENV: 'production'
      }
   }]
}