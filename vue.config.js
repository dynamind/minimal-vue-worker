module.exports = {
  chainWebpack: config => {
    config.output
      .globalObject('this')
  }
}
