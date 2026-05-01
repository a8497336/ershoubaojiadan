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
    apiBase: 'http://localhost:3000/api',
    imageBase: 'http://localhost:3000',
    env: 'production'
  }
}

const getConfig = () => {
  return ENV_CONFIG.production
}

const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${getConfig().imageBase}${path}`
}

module.exports = {
  ENV_CONFIG,
  getConfig,
  getImageUrl,
  CURRENT_CONFIG: getConfig()
}
