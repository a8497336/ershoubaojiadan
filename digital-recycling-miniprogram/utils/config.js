const ENV_CONFIG = {
  development: {
    apiBase: 'http://localhost:3000/api',
    imageBase: 'http://localhost:3000',
    env: 'development'
  },
  test: {
    apiBase: 'http://localhost:3000/api',
    imageBase: 'http://localhost:3000',
    env: 'test'
  },
  production: {
    apiBase: 'https://wx.lydzhsw.com/api',
    imageBase: 'https://wx.lydzhsw.com',
    env: 'production'
  }
}

const ENV_MAP = {
  develop: 'development',
  trial: 'test',
  release: 'production'
}

const getConfig = () => {
  try {
    const envVersion = wx.getAccountInfoSync().miniProgram.envVersion
    const env = 'production'
    return ENV_CONFIG[env]
  } catch (e) {
    return ENV_CONFIG.production
  }
}

const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http://')) return path.replace('http://', 'https://')
  if (path.startsWith('https://')) return path
  return `${getConfig().imageBase}${path}`
}

module.exports = {
  ENV_CONFIG,
  getConfig,
  getImageUrl,
  CURRENT_CONFIG: getConfig()
}
