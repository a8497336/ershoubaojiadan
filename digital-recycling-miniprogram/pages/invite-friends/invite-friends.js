const app = getApp()
const { userApi, inviteApi } = require('../../utils/api-modules')

const POSTER_W = 375
const POSTER_H = 667

Page({
  data: {
    userInfo: {},
    inviteCode: '',
    inviteCount: 0,
    totalReward: 0,
    qrCodeUrl: '',
    inviteList: [],
    loading: true,
    networkError: false,
    posterLoading: false,
    showPosterModal: false,
    tempPosterPath: ''
  },

  onLoad() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    this.loadInviteInfo()
  },

  onPullDownRefresh() {
    this.loadInviteInfo()
  },

  retryLoad() {
    this.setData({ loading: true, networkError: false })
    this.loadInviteInfo()
  },

  noop() {},

  async loadInviteInfo() {
    this.setData({ loading: true, networkError: false })
    try {
      const token = wx.getStorageSync('token')
      if (!token) {
        wx.showToast({ title: '请先登录', icon: 'none' })
        wx.navigateTo({ url: '/pages/login/login?redirect=' + encodeURIComponent('/pages/invite-friends/invite-friends') })
        return
      }

      const [profileRes, statsRes, recordsRes, qrRes] = await Promise.all([
        userApi.getProfile().catch(() => ({})),
        inviteApi.getStats().catch(() => ({})),
        inviteApi.getRecords({ page: 1, pageSize: 20 }).catch(() => ({})),
        inviteApi.getQrCode().catch(() => ({}))
      ])

      const profile = profileRes.data || profileRes || {}
      const stats = statsRes.data || statsRes || {}
      const records = recordsRes.data || recordsRes || {}
      const qr = qrRes.data || qrRes || {}

      const inviteCode = profile.userId || profile.userNo || profile.user_no || ''
      const inviteList = (records.list || []).map(item => ({
        ...item,
        createdAt: this.formatTime(item.createdAt)
      }))

      this.setData({
        userInfo: profile,
        inviteCode,
        inviteCount: stats.inviteCount || 0,
        totalReward: stats.grantedRewardTimes || 0,
        qrCodeUrl: qr.qrCodeUrl || '',
        inviteList,
        loading: false,
        networkError: false
      })
    } catch (err) {
      console.error('获取邀请信息失败:', err)
      this.setData({
        loading: false,
        networkError: true
      })
    } finally {
      wx.stopPullDownRefresh()
    }
  },

  handleCopyCode() {
    const code = this.data.inviteCode
    if (!code) {
      wx.showToast({ title: '暂无邀请码', icon: 'none' })
      return
    }

    wx.setClipboardData({
      data: String(code),
      success: () => {
        wx.vibrateShort({ type: 'light' })
        wx.showToast({ title: '邀请码已复制', icon: 'success' })
      },
      fail: () => {
        wx.showModal({
          title: '邀请码',
          content: code,
          showCancel: false
        })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '邀请你加入联赢电子回收网，查看实时回收报价',
      path: `/pages/index/index?invite_code=${this.data.inviteCode}`,
      imageUrl: '/images/share-cover.png'
    }
  },

  onShareTimeline() {
    return {
      title: '邀请你加入联赢电子回收网，查看实时回收报价',
      query: `invite_code=${this.data.inviteCode}`,
      imageUrl: '/images/share-cover.png'
    }
  },

  /**
   * 点击「保存海报」：弹出海报预览弹窗，在弹窗中渲染 Canvas
   */
  async handleSavePoster() {
    if (this.data.posterLoading) return

    const { inviteCode, qrCodeUrl } = this.data
    if (!inviteCode) {
      wx.showToast({ title: '暂无邀请码', icon: 'none' })
      return
    }

    this.setData({ posterLoading: true, showPosterModal: true, tempPosterPath: '' })
    wx.showLoading({ title: '海报生成中...' })

    // 等弹窗渲染完成后再获取 Canvas 节点
    setTimeout(async () => {
      try {
        const posterPath = await this.drawPoster()
        this.setData({ tempPosterPath: posterPath, posterLoading: false })
        wx.hideLoading()
      } catch (err) {
        console.error('生成海报失败:', err)
        wx.hideLoading()
        this.setData({ posterLoading: false, showPosterModal: false })
        wx.showToast({ title: err.message || '海报生成失败', icon: 'none', duration: 3000 })
      }
    }, 300)
  },

  /**
   * 弹窗中点击「保存到相册」
   */
  doSavePoster() {
    const path = this.data.tempPosterPath
    if (!path) {
      wx.showToast({ title: '海报尚未生成', icon: 'none' })
      return
    }
    this.savePosterToAlbum(path)
  },

  /**
   * 关闭海报弹窗
   */
  closePosterModal() {
    this.setData({ showPosterModal: false, tempPosterPath: '' })
  },

  /**
   * Canvas 点击事件：命中 X 关闭按钮则关闭弹窗
   * X 圆心：海报内 (POSTER_W - 32, 32) = (343, 32)，半径 16
   */
  onCanvasTap(e) {
    const { x, y } = e.detail || {}
    if (typeof x !== 'number' || typeof y !== 'number') return
    const cx = 343, cy = 32, r = 16
    const dx = x - cx, dy = y - cy
    if (dx * dx + dy * dy <= r * r) {
      this.closePosterModal()
    }
  },

  /**
   * Canvas 2D 绘制海报（375×667 蓝色渐变卡片式设计）
   */
  drawPoster() {
    return new Promise((resolve, reject) => {
      const { inviteCode, qrCodeUrl, userInfo } = this.data
      if (!inviteCode) {
        reject(new Error('缺少邀请码'))
        return
      }

      const query = wx.createSelectorQuery()
      query.select('#posterCanvas').fields({ node: true, size: true }).exec(async (res) => {
        if (!res || !res[0] || !res[0].node) {
          reject(new Error('Canvas 节点获取失败，请重试'))
          return
        }

        try {
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          const dpr = wx.getSystemInfoSync().pixelRatio

          canvas.width = POSTER_W * dpr
          canvas.height = POSTER_H * dpr
          ctx.scale(dpr, dpr)

          // 预加载图片
          const avatarImg = await this.loadCanvasImage(canvas, userInfo.avatar || '/images/icons/avatar.svg').catch(() => null)
          const qrImg = await this.loadCanvasImage(canvas, qrCodeUrl).catch(() => null)

          // ========== 1. 蓝色渐变背景 ==========
          const bgGradient = ctx.createLinearGradient(0, 0, 0, POSTER_H)
          bgGradient.addColorStop(0, '#0A84FF')
          bgGradient.addColorStop(0.4, '#2196F3')
          bgGradient.addColorStop(0.75, '#4DB6F7')
          bgGradient.addColorStop(1, '#5AC8FA')
          ctx.fillStyle = bgGradient
          ctx.fillRect(0, 0, POSTER_W, POSTER_H)

          // ========== 2. 装饰圆点 ==========
          ctx.fillStyle = 'rgba(255,255,255,0.06)'
          ctx.beginPath(); ctx.arc(330, 100, 150, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.arc(40, 500, 90, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.arc(300, 620, 60, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.arc(60, 200, 40, 0, Math.PI * 2); ctx.fill()

          // ========== 关闭按钮 ==========
          // const closeBtnCx = POSTER_W - 32
          // const closeBtnCy = 32
          // const closeBtnR = 16
          // ctx.fillStyle = 'rgba(0,0,0,0.4)'
          // ctx.beginPath()
          // ctx.arc(closeBtnCx, closeBtnCy, closeBtnR, 0, Math.PI * 2)
          // ctx.fill()
          // ctx.fillStyle = '#ffffff'
          // ctx.font = 'bold 18px sans-serif'
          // ctx.textAlign = 'center'
          // ctx.textBaseline = 'middle'
          // ctx.fillText('×', closeBtnCx, closeBtnCy + 1)

          // ========== 3. 顶部白色卡片（个人信息） ==========
          const cardX = 20, cardY = 48, cardW = 335, cardH = 210, cardR = 18
          ctx.shadowColor = 'rgba(0,0,0,0.1)'
          ctx.shadowBlur = 20
          ctx.shadowOffsetY = 6
          this.roundRect(ctx, cardX, cardY, cardW, cardH, cardR)
          ctx.fillStyle = '#ffffff'
          ctx.fill()
          ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0

          // 卡片内边框
          ctx.strokeStyle = 'rgba(10,132,255,0.08)'
          ctx.lineWidth = 1.5
          this.roundRect(ctx, cardX + 14, cardY + 14, cardW - 28, cardH - 28, 12)
          ctx.stroke()

          // 头像
          const avatarSize = 64
          const avatarCx = POSTER_W / 2
          const avatarCy = cardY + 58
          ctx.beginPath()
          ctx.arc(avatarCx, avatarCy, avatarSize / 2 + 4, 0, Math.PI * 2)
          ctx.fillStyle = '#ffffff'
          ctx.fill()
          ctx.save()
          ctx.beginPath()
          ctx.arc(avatarCx, avatarCy, avatarSize / 2, 0, Math.PI * 2)
          ctx.clip()
          if (avatarImg) {
            ctx.drawImage(avatarImg, avatarCx - avatarSize / 2, avatarCy - avatarSize / 2, avatarSize, avatarSize)
          } else {
            ctx.fillStyle = '#E8EDF2'
            ctx.fill()
            ctx.fillStyle = '#B0BEC5'
            ctx.font = '22px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('?', avatarCx, avatarCy)
          }
          ctx.restore()

          const nickname = (userInfo.nickname || '微信用户').slice(0, 10)
          ctx.fillStyle = '#1a1a1a'
          ctx.font = 'bold 16px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.fillText(nickname, POSTER_W / 2, avatarCy + avatarSize / 2 + 10)

          ctx.fillStyle = '#999999'
          ctx.font = '13px sans-serif'
          ctx.fillText('邀请你加入', POSTER_W / 2, avatarCy + avatarSize / 2 + 34)

          ctx.fillStyle = '#0A84FF'
          ctx.font = 'bold 22px sans-serif'
          ctx.fillText('联赢电子回收网', POSTER_W / 2, avatarCy + avatarSize / 2 + 58)

          // ========== 4. 标语区 ==========
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 18px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.fillText('查看实时报价  赚取回收收益', POSTER_W / 2, cardY + cardH + 28)

          // 三个亮点标签
          const features = ['免费查价', '即时到账', '安全可靠']
          const featureY = cardY + cardH + 58
          const totalW = 290
          const gap = 16
          const itemW = (totalW - gap * 2) / 3
          const startX = (POSTER_W - totalW) / 2
          features.forEach((feat, i) => {
            const fx = startX + i * (itemW + gap)
            this.roundRect(ctx, fx, featureY, itemW, 32, 16)
            ctx.fillStyle = 'rgba(255,255,255,0.18)'
            ctx.fill()
            ctx.fillStyle = '#ffffff'
            ctx.font = '12px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(feat, fx + itemW / 2, featureY + 16)
          })

          // ========== 5. 白色二维码卡片 ==========
          const qrCardX = 28, qrCardY = featureY + 56, qrCardW = 319, qrCardH = 200, qrCardR = 16
          ctx.shadowColor = 'rgba(0,0,0,0.12)'
          ctx.shadowBlur = 24
          ctx.shadowOffsetY = 8
          this.roundRect(ctx, qrCardX, qrCardY, qrCardW, qrCardH, qrCardR)
          ctx.fillStyle = '#ffffff'
          ctx.fill()
          ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0

          // 二维码
          const qrSize = 120
          const qrQx = qrCardX + 28
          const qrQy = qrCardY + 40
          if (qrImg) {
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(qrQx - 4, qrQy - 4, qrSize + 8, qrSize + 8)
            ctx.drawImage(qrImg, qrQx, qrQy, qrSize, qrSize)
          } else {
            // 二维码占位
            this.roundRect(ctx, qrQx, qrQy, qrSize, qrSize, 8)
            ctx.strokeStyle = '#E0E0E0'
            ctx.lineWidth = 1
            ctx.stroke()
            ctx.fillStyle = '#BDBDBD'
            ctx.font = '12px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('二维码加载中', qrQx + qrSize / 2, qrQy + qrSize / 2)
          }

          // 右侧引导文字
          const textX = qrQx + qrSize + 28
          ctx.fillStyle = '#1a1a1a'
          ctx.font = 'bold 20px sans-serif'
          ctx.textAlign = 'left'
          ctx.textBaseline = 'top'
          ctx.fillText('扫码进入', textX, qrCardY + 70)

          ctx.fillStyle = '#666666'
          ctx.font = '15px sans-serif'
          ctx.fillText('查看实时报价', textX, qrCardY + 98)

          ctx.fillStyle = '#999999'
          ctx.font = '12px sans-serif'
          ctx.fillText('微信一键登录', textX, qrCardY + 120)

          // 分割线
          ctx.strokeStyle = '#F0F0F0'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(qrCardX + 24, qrCardY + qrCardH - 42)
          ctx.lineTo(qrCardX + qrCardW - 24, qrCardY + qrCardH - 42)
          ctx.stroke()

          // 邀请码
          ctx.fillStyle = '#999999'
          ctx.font = '12px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.fillText('我的邀请码', POSTER_W / 2, qrCardY + qrCardH - 50)

          ctx.fillStyle = '#0A84FF'
          ctx.font = 'bold 18px sans-serif'
          ctx.fillText(inviteCode, POSTER_W / 2, qrCardY + qrCardH - 30)

          // ========== 6. 底部 ==========
          ctx.fillStyle = 'rgba(255,255,255,0.6)'
          ctx.font = '11px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          ctx.fillText('长按识别二维码，微信一键登录', POSTER_W / 2, POSTER_H - 14)

          // 导出海报
          wx.canvasToTempFilePath({
            canvas: canvas,
            x: 0, y: 0,
            width: POSTER_W, height: POSTER_H,
            destWidth: POSTER_W * dpr, destHeight: POSTER_H * dpr,
            fileType: 'png',
            quality: 1,
            success: (result) => resolve(result.tempFilePath),
            fail: (err) => reject(err)
          })
        } catch (err) {
          reject(err)
        }
      })
    })
  },

  /**
   * 绘制圆角矩形路径
   */
  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
  },

  loadCanvasImage(canvas, url) {
    return new Promise((resolve, reject) => {
      if (!url) {
        reject(new Error('图片地址为空'))
        return
      }

      const img = canvas.createImage()
      img.onload = () => resolve(img)
      img.onerror = (e) => reject(e)

      if (url.startsWith('/images/') || url.startsWith('wxfile://') || url.startsWith('http://tmp')) {
        img.src = url
        return
      }

      wx.downloadFile({
        url: url,
        success: (res) => {
          if (res.statusCode === 200) {
            img.src = res.tempFilePath
          } else {
            reject(new Error('下载图片失败: ' + res.statusCode))
          }
        },
        fail: (err) => reject(err)
      })
    })
  },

  savePosterToAlbum(filePath) {
    wx.saveImageToPhotosAlbum({
      filePath,
      success: () => {
        wx.showToast({ title: '海报已保存到相册', icon: 'success' })
        this.setData({ showPosterModal: false, tempPosterPath: '' })
      },
      fail: (err) => {
        console.error('保存海报失败:', err)
        if (err.errMsg && (err.errMsg.includes('auth deny') || err.errMsg.includes('authorize'))) {
          wx.showModal({
            title: '需要相册权限',
            content: '保存海报需要访问相册权限，是否前往设置开启？',
            confirmText: '去开启',
            success: (res) => {
              if (res.confirm && typeof wx.openSetting === 'function') {
                wx.openSetting()
              }
            }
          })
        } else {
          wx.showToast({ title: '保存失败，请重试', icon: 'none' })
        }
      }
    })
  },

  formatTime(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
})