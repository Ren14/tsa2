module.exports = {
  publicPath: './',
  configureWebpack: {
    output: {
      filename: 'tsa2.js'
    },
    optimization: {
      splitChunks: false
    },
  },
  filenameHashing: false
};
