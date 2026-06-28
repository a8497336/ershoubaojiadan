/**
 * dom 项目环境配置
 * 与主项目 digital-recycling-miniprogram 共用同一后端服务
 *
 * 注:虚拟支付 env(0=现网 1=沙箱)由服务端 .env 的 WX_VIRTUAL_PAY_ENV 决定,
 *     前端不单独配置,从 /sign 接口响应中读取并展示
 */
const ENV_CONFIG = {
  development: {
    apiBase: 'http://localhost:3000/api/dom'
  },
  production: {
    apiBase: 'https://wx.lydzhsw.com/api/dom'
  }
}

// 本地测试走 development(localhost:3000),生产部署时改回 production
const getConfig = () => ENV_CONFIG.production

module.exports = { getConfig, ENV_CONFIG }
