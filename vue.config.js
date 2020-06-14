module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://kongfandong.cn/',
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
}
