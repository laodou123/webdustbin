const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  devServer: {
    proxy: [
      {
        context: ['/api'],
        target: 'http://119.23.150.226:8888',
        pathRewrite: { '^/api': '' }
      }
    ],
  }
};