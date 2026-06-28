/**
 * 定位测试 Demo - 首页
 * 5 个调试按钮：隐私预检 / 隐私授权 / 获取模糊位置 / 一键完整流程 / 清除缓存
 * 复用主项目 digital-recycling-miniprogram 的错误处理逻辑
 */

const app = getApp()

Page({
  data: {
    systemInfo: '',           // wx.getSystemInfoSync 摘要
    sdkVersion: '',            // SDKVersion（独立字段便于 wxml 判断）
    privacyStatus: '',         // 隐私设置展示
    locationResult: '',        // 定位结果展示
    consoleLogs: [],           // 日志（最多 10 条）
    loading: false
  },

  onLoad() {
    this.log('页面加载 - 准备就绪')
    this._loadSystemInfo()
  },

  onShow() {
    this.log('页面 onShow')
  },

  // 加载系统信息
  _loadSystemInfo() {
    try {
      const sys = wx.getSystemInfoSync()
      const summary = `libVersion=${sys.SDKVersion || '-'} | model=${sys.model || '-'} | system=${sys.system || '-'} | platform=${sys.platform || '-'}`
      this.setData({
        systemInfo: summary,
        sdkVersion: sys.SDKVersion || ''
      })
      this.log('系统信息: ' + summary)
      // 检查 API 是否可用
      const apis = []
      apis.push(typeof wx.getPrivacySetting === 'function' ? 'getPrivacySetting✓' : 'getPrivacySetting✗')
      apis.push(typeof wx.requirePrivacyAuthorize === 'function' ? 'requirePrivacyAuthorize✓' : 'requirePrivacyAuthorize✗')
      apis.push(typeof wx.getFuzzyLocation === 'function' ? 'getFuzzyLocation✓' : 'getFuzzyLocation✗')
      this.log('API 可用性: ' + apis.join(' | '))
    } catch (e) {
      this.log('getSystemInfoSync fail: ' + (e && e.message || JSON.stringify(e)), 'error')
    }
  },

  // 日志工具（写入 data.consoleLogs）
  log(msg, level = 'info') {
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false })
    const line = `[${time}] [${level.toUpperCase()}] ${msg}`
    console.log(line)
    const logs = [line, ...this.data.consoleLogs].slice(0, 10)
    this.setData({ consoleLogs: logs })
  },

  // [1] 检测隐私设置
  onCheckPrivacySetting() {
    this.log('--- 开始: [1] 检测隐私设置 ---')
    if (typeof wx.getPrivacySetting !== 'function') {
      this.log('当前基础库不支持 wx.getPrivacySetting', 'error')
      this.setData({ privacyStatus: '基础库不支持（SDKVersion < 2.32.3）' })
      return
    }
    wx.getPrivacySetting({
      success: (res) => {
        const text = `needAuthorization=${res.needAuthorization} | privacyContractName=${res.privacyContractName || '-'}`
        this.log('getPrivacySetting success: ' + text)
        this.setData({ privacyStatus: text })
        app.globalData.privacySetting = res
      },
      fail: (err) => {
        this.log('getPrivacySetting fail: ' + (err.errMsg || JSON.stringify(err)), 'error')
        this.setData({ privacyStatus: '查询失败: ' + (err.errMsg || '未知错误') })
      }
    })
  },

  // [2] 申请隐私授权（弹原生隐私声明弹窗）
  onRequirePrivacyAuthorize() {
    this.log('--- 开始: [2] 申请隐私授权 ---')
    this.log('正在弹出原生隐私授权弹窗（请在弹窗中选择「同意」或「拒绝」）')
    if (typeof wx.requirePrivacyAuthorize !== 'function') {
      this.log('当前基础库不支持 wx.requirePrivacyAuthorize', 'error')
      this.setData({ privacyStatus: '基础库不支持（SDKVersion < 3.0.0）' })
      return
    }
    wx.requirePrivacyAuthorize({
      success: () => {
        this.log('requirePrivacyAuthorize SUCCESS - 用户同意隐私协议')
        this.setData({ privacyStatus: '✓ 已同意隐私协议' })
      },
      fail: (err) => {
        const errMsg = (err && err.errMsg) || JSON.stringify(err)
        this.log('requirePrivacyAuthorize FAIL: ' + errMsg, 'error')
        this.setData({ privacyStatus: '✗ 拒绝: ' + errMsg })
      }
    })
  },

  // [3] 获取模糊位置
  onGetFuzzyLocation() {
    this.log('--- 开始: [3] 获取模糊位置 ---')
    if (typeof wx.getFuzzyLocation !== 'function') {
      this.log('当前基础库不支持 wx.getFuzzyLocation', 'error')
      this.setData({ locationResult: '基础库不支持（SDKVersion < 2.25.0）' })
      return
    }
    this.setData({ loading: true })
    wx.getFuzzyLocation({
      type: 'gcj02',
      success: (res) => {
        const text = `lat=${(res.latitude || 0).toFixed(6)} | lng=${(res.longitude || 0).toFixed(6)} | acc=${res.accuracy || 0}m | speed=${res.speed || '-'} | altitude=${res.altitude || '-'}`
        this.log('getFuzzyLocation SUCCESS: ' + text)
        this.setData({ locationResult: text })
        app.globalData.lastLocation = res
      },
      fail: (err) => {
        const errMsg = (err && err.errMsg) || '未知错误'
        this.log('getFuzzyLocation FAIL: ' + errMsg, 'error')
        this.setData({ locationResult: '✗ 失败: ' + errMsg })
        this._showErrorHint(errMsg)
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },

  // [4] 一键完整流程：先查隐私 → 申请隐私 → 定位
  onFullFlow() {
    this.log('=== 开始: [4] 完整流程（隐私预检 → 申请 → 定位）===')
    if (typeof wx.getPrivacySetting !== 'function') {
      this.log('基础库不支持 getPrivacySetting，直接定位', 'warn')
      this.onGetFuzzyLocation()
      return
    }
    wx.getPrivacySetting({
      success: (res) => {
        this.log('步骤1/3: 隐私预检 needAuthorization=' + res.needAuthorization)
        if (res.needAuthorization) {
          this.log('步骤2/3: 弹出隐私授权')
          if (typeof wx.requirePrivacyAuthorize !== 'function') {
            this.log('基础库不支持 requirePrivacyAuthorize，跳过', 'warn')
            this.log('步骤3/3: 调用 getFuzzyLocation')
            this.onGetFuzzyLocation()
            return
          }
          wx.requirePrivacyAuthorize({
            success: () => {
              this.log('步骤2/3: ✓ 用户同意隐私')
              this.log('步骤3/3: 调用 getFuzzyLocation')
              this.onGetFuzzyLocation()
            },
            fail: (err) => {
              const errMsg = (err && err.errMsg) || ''
              this.log('步骤2/3: ✗ 用户拒绝隐私 ' + errMsg, 'error')
              wx.showToast({ title: '用户拒绝隐私授权', icon: 'none', duration: 2000 })
            }
          })
        } else {
          this.log('步骤2/3: 隐私已同意，跳过')
          this.log('步骤3/3: 调用 getFuzzyLocation')
          this.onGetFuzzyLocation()
        }
      },
      fail: (err) => {
        this.log('隐私预检失败，直接定位: ' + (err.errMsg || ''), 'warn')
        this.onGetFuzzyLocation()
      }
    })
  },

  // [5] 清除缓存
  onClearCache() {
    this.log('--- 开始: [5] 清除缓存 ---')
    try {
      wx.removeStorageSync('location_prompt_done')
      wx.removeStorageSync('location_permission_done')
      wx.removeStorageSync('privacy_agreed')
      app.globalData.lastLocation = null
      app.globalData.privacySetting = null
      this.setData({ privacyStatus: '', locationResult: '' })
      this.log('已清除 demo 缓存（含 location_prompt_done / privacy_agreed）')
      wx.showToast({ title: '已清除', icon: 'success' })
    } catch (e) {
      this.log('clear cache fail: ' + (e && e.message || JSON.stringify(e)), 'error')
    }
  },

  // [6] 跳转虚拟支付测试页(virtual-pay 为 tabBar 页,必须用 switchTab)
  onGoVirtualPay() {
    this.log('--- 开始: [6] 跳转虚拟支付测试页 ---')
    wx.switchTab({
      url: '/pages/virtual-pay/virtual-pay',
      success: () => this.log('跳转成功'),
      fail: (err) => this.log('跳转失败: ' + (err.errMsg || ''), 'error')
    })
  },

  // 复制最近一次定位结果到剪贴板
  onCopyLocation() {
    const loc = app.globalData.lastLocation
    if (!loc) {
      this.log('尚无定位结果可复制', 'warn')
      wx.showToast({ title: '暂无定位结果', icon: 'none' })
      return
    }
    wx.setClipboardData({
      data: `${loc.latitude},${loc.longitude}`,
      success: () => {
        this.log('已复制 lat,lng 到剪贴板')
        wx.showToast({ title: '已复制', icon: 'success' })
      },
      fail: (err) => {
        this.log('复制失败: ' + (err.errMsg || ''), 'error')
      }
    })
  },

  // 复用主项目错误处理逻辑（见 digital-recycling-miniprogram/pages/index/index.js#L715-L738）
  _showErrorHint(errMsg) {
    let content = errMsg
    let confirmText = '我知道了'
    let showCancel = false

    if (errMsg.includes('system permission denied') || errMsg.includes('ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF')) {
      content = '系统未授权微信位置权限。\n\n请前往：\n【设置】→【隐私】→【定位服务】→ 找到【微信】→ 改为【使用期间】或【始终】'
      confirmText = '去开启'
      showCancel = true
    } else if (errMsg.includes('fuzzyLocation:fail system permission denied')) {
      content = 'iOS 系统未开启微信的位置权限。\n\n请前往：\n【设置】→【微信】→【位置】→ 改为【使用 App 期间】或【始终】'
      confirmText = '去开启'
      showCancel = true
    } else if (errMsg.includes('fail authorize') || errMsg.includes('auth deny') || errMsg.includes('auth denied')) {
      content = '用户拒绝了位置授权。\n\n如需重新授权，请进入：\n【设置】→【微信】→【位置】→ 改为【使用 App 期间】'
      confirmText = '去开启'
      showCancel = true
    } else if (errMsg.includes('fuzzyLocation:fail')) {
      content = '模糊位置接口调用失败。\n\n可能原因：\n1. 微信公众平台后台未登记《用户隐私保护指引》\n2. 隐私协议未配置 getFuzzyLocation 类型\n3. 用户未同意隐私协议\n\nerrMsg: ' + errMsg
    }

    wx.showModal({
      title: '定位失败',
      content,
      confirmText,
      cancelText: '关闭',
      showCancel,
      success: (res) => {
        if (res.confirm && confirmText === '去开启' && typeof wx.openAppAuthorizeSetting === 'function') {
          wx.openAppAuthorizeSetting()
        }
      }
    })
  }
})