<template>
  <div class="page-container">
    <div class="top-nav">
      <div class="back-icon" @click="goBack" role="button" tabindex="0">
        <span>←</span>
      </div>
      <div class="nav-title">拍照查价</div>
      <div class="nav-right" @click="showHistory = true" role="button" tabindex="0">
        <span>📋</span>
      </div>
    </div>

    <div class="main-red-section">
      <h1 class="main-title">拍照片 查价格</h1>

      <div class="count-bar">
        <div class="count-item">
          <span class="num">{{ points }} 分</span>
          <span class="label">拥有积分</span>
        </div>
        <div class="count-divider"></div>
        <div class="count-item">
          <span class="num" :class="{ 'low-times': remainingTimes <= 2 }">{{ remainingTimes }} 次</span>
          <span class="label">剩余次数</span>
        </div>
      </div>

      <div class="click-wrap" @click="showActionSheet = true" role="button" tabindex="0">
        <div class="corner-mark corner-tl"></div>
        <div class="corner-mark corner-tr"></div>
        <div class="corner-mark corner-bl"></div>
        <div class="corner-mark corner-br"></div>

        <div class="click-circle" :class="{ 'scanning': isProcessing }">
          <template v-if="isProcessing">
            <div class="scan-animation">
              <div class="scan-line"></div>
              <span class="scan-text">识别中...</span>
            </div>
          </template>
          <template v-else>
            <div class="camera-icon">📷</div>
            <span class="click-text">点击<br>拍照查价</span>
          </template>
        </div>
        <svg v-if="!isProcessing" class="hand-icon" viewBox="0 0 100 100" fill="none">
          <path d="M55 20 C75 30, 90 50, 80 70 C70 85, 50 80, 45 65 C40 50, 50 30,55 20Z" fill="#ffd6cb"/>
          <rect x="42" y="62" width="20" height="25" rx="4" fill="#ff2b3b"/>
        </svg>
      </div>

      <div class="digital-tag">数码</div>
    </div>

    <div class="tip-text">
      请尽量拍摄<strong>手机背面</strong>，特征明显的一面
    </div>

    <div v-if="previewImage" class="preview-section">
      <div class="preview-header">
        <h3>📷 已选图片</h3>
        <span class="preview-close" @click="clearPreview">✕</span>
      </div>
      <div class="preview-image-wrap">
        <img :src="previewImage" alt="预览图片" class="preview-image" @load="onPreviewLoaded" @error="onPreviewError">
        <div v-if="imageLoading" class="preview-loading">
          <LoadingSpinner size="small" color="white" text="加载中..." />
        </div>
      </div>
      <button class="recognize-btn" :disabled="isProcessing" @click="startRecognize">
        <template v-if="isProcessing">
          <LoadingSpinner size="small" color="white" />
          <span>识别中...</span>
        </template>
        <template v-else>
          <span>🔍</span>
          <span>开始识别</span>
        </template>
      </button>
    </div>

    <div v-if="recognizedProducts.length > 0" class="result-section">
      <div class="result-header">
        <h3>🎯 识别结果</h3>
        <span class="result-count">找到 {{ recognizedProducts.length }} 个匹配</span>
      </div>

      <div v-if="recognizedKeywords.length > 0" class="keywords-bar">
        <span class="keywords-label">识别关键词：</span>
        <span v-for="kw in recognizedKeywords" :key="kw" class="keyword-tag">{{ kw }}</span>
      </div>

      <div v-if="!recognizedFlag" class="result-notice">
        <span>💡 未能精确识别，以下为推荐机型</span>
      </div>

      <div class="product-list">
        <div v-for="product in recognizedProducts" :key="product.id" class="product-card" @click="goToProductDetail(product)">
          <div class="product-image-wrap">
            <img v-if="product.image" :src="product.image" :alt="product.name" class="product-image">
            <div v-else class="product-image-placeholder">
              <span>{{ (product.Brand?.name || '数码').charAt(0) }}</span>
            </div>
          </div>
          <div class="product-info">
            <div class="product-brand">{{ product.Brand?.name || '' }}</div>
            <div class="product-name">{{ product.name }}</div>
            <div class="product-model" v-if="product.model_code">{{ product.model_code }}</div>
            <div class="product-category" v-if="product.Category?.name">{{ product.Category.name }}</div>
          </div>
          <div class="product-price-area">
            <div v-if="product.maxPrice > 0" class="price-range">
              <span class="price-max">¥{{ product.maxPrice }}</span>
              <span v-if="product.minPrice > 0 && product.minPrice !== product.maxPrice" class="price-sep">~</span>
              <span v-if="product.minPrice > 0 && product.minPrice !== product.maxPrice" class="price-min">¥{{ product.minPrice }}</span>
            </div>
            <div v-else class="price-none">暂无报价</div>
            <div v-if="product.priceCount > 0" class="price-conditions">{{ product.priceCount }}种成色报价</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="error-section">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ errorMessage }}</span>
        <button class="error-retry" @click="retryLastAction">重试</button>
      </div>
    </div>

    <div v-if="!previewImage && recognizedProducts.length === 0 && !errorMessage" class="compare-section">
      <h3 class="compare-title">📸 拍摄示例</h3>
      <div class="compare-row">
        <div class="compare-card card-correct">
          <div class="card-image-wrapper">
            <img class="phone-preview" alt="手机背面正确示例" src="https://picsum.photos/id/160/400/700" loading="lazy">
            <div class="overlay-correct"></div>
          </div>
          <div class="card-bottom correct-bottom">
            <span class="check-circle">✓</span>
            <span class="card-text">正确（更快识别）</span>
          </div>
        </div>
        <div class="compare-card card-wrong">
          <div class="card-image-wrapper">
            <img class="phone-preview" alt="手机正面错误示例" src="https://picsum.photos/id/119/400/700" loading="lazy">
            <div class="overlay-wrong"></div>
          </div>
          <div class="card-bottom wrong-bottom">
            <span class="check-circle">×</span>
            <span class="card-text">错误（不易识别）</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!previewImage && recognizedProducts.length === 0 && !errorMessage" class="quick-search-section">
      <h3 class="quick-search-title">🔥 热门搜索</h3>
      <div class="quick-search-tags">
        <span v-for="tag in hotTags" :key="tag" class="hot-tag" @click="searchByKeyword(tag)">{{ tag }}</span>
      </div>
    </div>

    <div class="bottom-actions">
      <button class="action-btn secondary-btn" @click="showHistory = true">
        <span>📋</span> 查看历史
      </button>
      <button class="action-btn primary-btn" @click="showActionSheet = true">
        <span>📷</span> 拍照查价
      </button>
    </div>

    <Transition name="slide-up">
      <div v-if="showActionSheet" class="action-sheet-overlay" @click.self="showActionSheet = false">
        <div class="action-sheet">
          <div class="action-sheet-header">
            <span>选择图片来源</span>
            <span class="action-sheet-close" @click="showActionSheet = false">✕</span>
          </div>
          <div class="action-sheet-body">
            <button class="action-sheet-item" @click="handleTakePhoto">
              <span class="action-sheet-icon">📸</span>
              <span>拍照识别</span>
            </button>
            <button class="action-sheet-item" @click="handleChooseFromAlbum">
              <span class="action-sheet-icon">🖼️</span>
              <span>从相册选择</span>
            </button>
            <button class="action-sheet-item" @click="handleManualInput">
              <span class="action-sheet-icon">⌨️</span>
              <span>手动输入型号</span>
            </button>
          </div>
          <button class="action-sheet-cancel" @click="showActionSheet = false">取消</button>
        </div>
      </div>
    </Transition>

    <Transition name="slide-up">
      <div v-if="showManualInput" class="modal-overlay" @click.self="showManualInput = false">
        <div class="modal-content">
          <div class="modal-header">
            <span>手动输入型号</span>
            <span class="modal-close" @click="showManualInput = false">✕</span>
          </div>
          <div class="modal-body">
            <input
              v-model="manualKeyword"
              type="text"
              class="manual-input"
              placeholder="请输入手机品牌或型号，如 iPhone 15 Pro"
              @keyup.enter="searchByManualInput"
            >
            <div class="manual-suggestions">
              <span v-for="s in manualSuggestions" :key="s" class="suggestion-tag" @click="manualKeyword = s; searchByManualInput()">{{ s }}</span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-btn cancel-btn" @click="showManualInput = false">取消</button>
            <button class="modal-btn confirm-btn" @click="searchByManualInput" :disabled="!manualKeyword.trim()">搜索</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="slide-up">
      <div v-if="showHistory" class="modal-overlay" @click.self="showHistory = false">
        <div class="modal-content history-modal">
          <div class="modal-header">
            <span>识别历史</span>
            <span class="modal-close" @click="showHistory = false">✕</span>
          </div>
          <div class="modal-body">
            <div v-if="scanHistory.length === 0" class="history-empty">
              <EmptyState icon="📋" title="暂无历史记录" description="拍照识别后记录将显示在这里" />
            </div>
            <div v-else class="history-list">
              <div v-for="(item, index) in scanHistory" :key="index" class="history-item" @click="loadHistoryResult(item)">
                <div class="history-image">
                  <img v-if="item.imageUrl" :src="item.imageUrl" alt="历史图片">
                  <span v-else class="history-image-placeholder">🔍</span>
                </div>
                <div class="history-info">
                  <div class="history-keywords">{{ item.keywords?.join('、') || '未知型号' }}</div>
                  <div class="history-time">{{ item.time }}</div>
                </div>
                <div class="history-result-count">{{ item.productCount }}个结果</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="slide-up">
      <div v-if="showVipModal" class="modal-overlay" @click.self="showVipModal = false">
        <div class="modal-content vip-modal">
          <div class="vip-icon">👑</div>
          <div class="vip-title">拍照次数不足</div>
          <div class="vip-desc">开通会员即可享受无限次拍照查价</div>
          <div class="vip-actions">
            <button class="vip-btn cancel" @click="showVipModal = false">稍后再说</button>
            <button class="vip-btn confirm" @click="goToMembership">开通会员</button>
          </div>
        </div>
      </div>
    </Transition>

    <ErrorToast
      v-model="showErrorToast"
      :type="errorToastType"
      :message="errorToastMessage"
      :duration="3000"
    />

    <AdvancedTabBar active-tab="scanPrice" />

    <input
      ref="cameraInput"
      type="file"
      accept="image/*"
      capture="environment"
      style="display: none"
      @change="onFileSelected"
    >
    <input
      ref="albumInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="onFileSelected"
    >
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import AdvancedTabBar from '../components/AdvancedTabBar.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'
import ErrorToast from '../components/ErrorToast.vue'
import { uploadApi, scanApi, cartApi } from '../api'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const points = ref(userStore.pointsBalance || 0)
const remainingTimes = ref(userStore.userInfo?.scanRemaining || 10)
const isProcessing = ref(false)
const previewImage = ref('')
const imageLoading = ref(false)
const selectedFile = ref<File | null>(null)
const recognizedProducts = ref<any[]>([])
const recognizedKeywords = ref<string[]>([])
const recognizedFlag = ref(false)
const errorMessage = ref('')
const showActionSheet = ref(false)
const showManualInput = ref(false)
const showHistory = ref(false)
const showVipModal = ref(false)
const manualKeyword = ref('')
const showErrorToast = ref(false)
const errorToastType = ref<'error' | 'warning' | 'success'>('error')
const errorToastMessage = ref('')
const scanHistory = ref<any[]>([])
const lastAction = ref<'camera' | 'album' | 'manual' | null>(null)

const cameraInput = ref<HTMLInputElement | null>(null)
const albumInput = ref<HTMLInputElement | null>(null)

const hotTags = ['iPhone 15', '华为 Mate 60', '小米14', 'OPPO Find', '三星 Galaxy', 'iPad Pro']

const manualSuggestions = ['iPhone 15 Pro Max', '华为 Pura 70', '小米14 Ultra', 'OPPO Find X7', 'vivo X100 Pro', '三星 S24 Ultra']

const goBack = () => {
  router.back()
}

const showToast = (type: 'error' | 'warning' | 'success', message: string) => {
  errorToastType.value = type
  errorToastMessage.value = message
  showErrorToast.value = true
}

const checkRemainingTimes = (): boolean => {
  if (remainingTimes.value <= 0 && !userStore.isVip) {
    showVipModal.value = true
    return false
  }
  return true
}

const handleTakePhoto = () => {
  showActionSheet.value = false
  if (!checkRemainingTimes()) return
  lastAction.value = 'camera'
  nextTick(() => {
    cameraInput.value?.click()
  })
}

const handleChooseFromAlbum = () => {
  showActionSheet.value = false
  if (!checkRemainingTimes()) return
  lastAction.value = 'album'
  nextTick(() => {
    albumInput.value?.click()
  })
}

const handleManualInput = () => {
  showActionSheet.value = false
  if (!checkRemainingTimes()) return
  lastAction.value = 'manual'
  manualKeyword.value = ''
  showManualInput.value = true
}

const onFileSelected = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    showToast('error', '请选择图片文件')
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    showToast('error', '图片大小不能超过10MB')
    return
  }

  selectedFile.value = file
  errorMessage.value = ''
  recognizedProducts.value = []
  recognizedKeywords.value = []

  imageLoading.value = true
  const reader = new FileReader()
  reader.onload = (ev) => {
    previewImage.value = ev.target?.result as string
  }
  reader.onerror = () => {
    imageLoading.value = false
    showToast('error', '图片读取失败，请重试')
  }
  reader.readAsDataURL(file)

  if (target) target.value = ''
}

const onPreviewLoaded = () => {
  imageLoading.value = false
}

const onPreviewError = () => {
  imageLoading.value = false
  showToast('error', '图片预览加载失败')
}

const clearPreview = () => {
  previewImage.value = ''
  selectedFile.value = null
  recognizedProducts.value = []
  recognizedKeywords.value = []
  errorMessage.value = ''
}

const startRecognize = async () => {
  if (isProcessing.value) return
  if (!selectedFile.value && !previewImage.value) {
    showToast('warning', '请先选择图片')
    return
  }

  isProcessing.value = true
  errorMessage.value = ''

  try {
    let imageUrl = ''

    if (selectedFile.value) {
      try {
        const uploadRes: any = await uploadApi.uploadFile(selectedFile.value)
        imageUrl = uploadRes.data?.url || ''
      } catch (e: any) {
        showToast('error', '图片上传失败，请检查网络后重试')
        isProcessing.value = false
        return
      }
    }

    if (!imageUrl && previewImage.value.startsWith('data:')) {
      showToast('error', '图片上传失败，请重试')
      isProcessing.value = false
      return
    }

    try {
      const recognizeRes: any = await scanApi.recognize({ imageUrl })
      const data = recognizeRes.data

      recognizedFlag.value = data.recognized
      recognizedKeywords.value = data.keywords || []
      recognizedProducts.value = data.products || []

      if (!data.recognized) {
        showToast('warning', data.message || '未能精确识别，为您推荐热门机型')
      } else {
        showToast('success', '识别成功')
      }

      remainingTimes.value = Math.max(0, remainingTimes.value - 1)

      addToHistory({
        imageUrl,
        keywords: data.keywords || [],
        productCount: data.products?.length || 0,
        time: new Date().toLocaleString('zh-CN'),
        products: data.products || []
      })
    } catch (e: any) {
      errorMessage.value = e.message || '识别失败，请重试'
      showToast('error', errorMessage.value)
    }
  } catch (e: any) {
    errorMessage.value = '处理失败，请重试'
    showToast('error', errorMessage.value)
  } finally {
    isProcessing.value = false
  }
}

const searchByKeyword = async (keyword: string) => {
  if (isProcessing.value) return
  if (!checkRemainingTimes()) return

  isProcessing.value = true
  errorMessage.value = ''
  previewImage.value = ''
  selectedFile.value = null

  try {
    const recognizeRes: any = await scanApi.recognize({ keywords: [keyword] })
    const data = recognizeRes.data

    recognizedFlag.value = data.recognized
    recognizedKeywords.value = data.keywords || []
    recognizedProducts.value = data.products || []

    if (!data.recognized) {
      showToast('warning', data.message || '未找到匹配产品')
    } else {
      showToast('success', '搜索成功')
    }

    remainingTimes.value = Math.max(0, remainingTimes.value - 1)

    addToHistory({
      keywords: data.keywords || [],
      productCount: data.products?.length || 0,
      time: new Date().toLocaleString('zh-CN'),
      products: data.products || []
    })
  } catch (e: any) {
    errorMessage.value = e.message || '搜索失败，请重试'
    showToast('error', errorMessage.value)
  } finally {
    isProcessing.value = false
  }
}

const searchByManualInput = async () => {
  const keyword = manualKeyword.value.trim()
  if (!keyword) return

  showManualInput.value = false
  await searchByKeyword(keyword)
}

const retryLastAction = () => {
  errorMessage.value = ''
  if (previewImage.value && selectedFile.value) {
    startRecognize()
  } else if (lastAction.value === 'camera') {
    handleTakePhoto()
  } else if (lastAction.value === 'album') {
    handleChooseFromAlbum()
  }
}

const goToProductDetail = (product: any) => {
  if (product.Brand?.id) {
    router.push(`/price-quote/${product.Brand.id}`)
  }
}

const goToMembership = () => {
  showVipModal.value = false
  router.push('/membership')
}

const addToHistory = (item: any) => {
  const history = [...scanHistory.value]
  history.unshift(item)
  if (history.length > 20) history.pop()
  scanHistory.value = history
  try {
    localStorage.setItem('scanHistory', JSON.stringify(history))
  } catch (e) {
    // ignore
  }
}

const loadHistoryResult = (item: any) => {
  showHistory.value = false
  if (item.products?.length) {
    recognizedProducts.value = item.products
    recognizedKeywords.value = item.keywords || []
    recognizedFlag.value = true
    previewImage.value = item.imageUrl || ''
  }
}

const loadHistoryFromStorage = () => {
  try {
    const stored = localStorage.getItem('scanHistory')
    if (stored) {
      scanHistory.value = JSON.parse(stored)
    }
  } catch (e) {
    // ignore
  }
}

onMounted(async () => {
  loadHistoryFromStorage()
  if (userStore.isLoggedIn) {
    try {
      await userStore.fetchProfile()
      await userStore.fetchPoints()
      points.value = userStore.pointsBalance || 0
      remainingTimes.value = userStore.userInfo?.scanRemaining || 10
    } catch (e) {
      // ignore
    }
  }
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.page-container {
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 100px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.top-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 16px;
  padding-top: calc(16px + env(safe-area-inset-top));
  background: linear-gradient(180deg, #ff2b3b 0%, #ff4754 100%);
  box-shadow: 0 2px 8px rgba(255, 43, 59, 0.3);
}

.back-icon {
  position: absolute;
  left: 20px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}

.back-icon:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.3);
}

.back-icon span {
  font-size: 24px;
  color: #fff;
  font-weight: 600;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.nav-right {
  position: absolute;
  right: 20px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.nav-right span {
  font-size: 20px;
}

.main-red-section {
  background: linear-gradient(180deg, #ff2b3b 0%, #ff4754 100%);
  padding: 30px 20px 80px;
  border-radius: 0 0 40% 40% / 0 0 12% 12%;
  position: relative;
}

.main-title {
  text-align: center;
  font-size: 36px;
  font-weight: 900;
  color: #fff;
  margin-bottom: 24px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 2px;
}

.count-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 32px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.count-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
}

.count-item {
  flex: 1;
  text-align: center;
}

.count-item .num {
  display: block;
  text-align: center;
  font-size: 32px;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.count-item .num.low-times {
  color: #ffd700;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.count-item .label {
  display: block;
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 4px;
}

.click-wrap {
  background: #fff;
  border-radius: 24px;
  padding: 48px 24px;
  position: relative;
  text-align: center;
  box-shadow: 0 8px 32px rgba(255, 43, 59, 0.2);
  transition: transform 0.3s ease;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.click-wrap:active {
  transform: scale(0.98);
}

.corner-mark {
  position: absolute;
  width: 32px;
  height: 32px;
  border: 4px solid #ff2b3b;
}

.corner-tl { top: 20px; left: 20px; border-right: none; border-bottom: none; border-radius: 8px 0 0 0; }
.corner-tr { top: 20px; right: 20px; border-left: none; border-bottom: none; border-radius: 0 8px 0 0; }
.corner-bl { bottom: 20px; left: 20px; border-right: none; border-top: none; border-radius: 0 0 0 8px; }
.corner-br { bottom: 20px; right: 20px; border-left: none; border-top: none; border-radius: 0 0 8px 0; }

.click-circle {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffecee, #fff);
  border: 8px solid #ff2b3b;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 8px 24px rgba(255, 43, 59, 0.3);
  transition: all 0.3s ease;
}

.click-wrap:active .click-circle {
  transform: scale(0.95);
  box-shadow: 0 4px 12px rgba(255, 43, 59, 0.2);
}

.click-circle::before {
  content: "";
  position: absolute;
  width: 230px;
  height: 230px;
  border: 3px dashed #ff999f;
  border-radius: 50%;
  opacity: 0.6;
  animation: rotate 20s linear infinite;
  will-change: transform;
}

.click-circle.scanning {
  border-color: #28b940;
  background: linear-gradient(145deg, #e8f9eb, #fff);
}

.click-circle.scanning::before {
  border-color: #28b940;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.scan-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;
}

.scan-line {
  width: 120px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #28b940, transparent);
  animation: scanMove 1.5s ease-in-out infinite;
}

@keyframes scanMove {
  0% { transform: translateY(-40px); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(40px); opacity: 0; }
}

.scan-text {
  font-size: 18px;
  font-weight: 600;
  color: #28b940;
}

.camera-icon {
  font-size: 48px;
  margin-bottom: 8px;
  animation: bounce 2s ease-in-out infinite;
  will-change: transform;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.click-text {
  font-size: 28px;
  font-weight: 700;
  color: #ff2b3b;
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.hand-icon {
  position: absolute;
  right: 16px;
  bottom: 16px;
  width: 100px;
  animation: wave 2s ease-in-out infinite;
  will-change: transform;
}

@keyframes wave {
  0%, 100% { transform: rotate(-5deg) translateY(0); }
  50% { transform: rotate(5deg) translateY(-5px); }
}

.digital-tag {
  width: 72px;
  height: 72px;
  background: linear-gradient(145deg, #fff, #f0f0f0);
  border-radius: 50%;
  color: #ff2b3b;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -36px auto 0;
  font-size: 18px;
  font-weight: 800;
  z-index: 10;
  position: relative;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.tip-text {
  text-align: center;
  font-size: 16px;
  color: #666;
  padding: 32px 20px;
  line-height: 1.6;
  background: #fff;
  margin: 0 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1;
  margin-top: -20px;
}

.tip-text strong {
  color: #ff2b3b;
  font-weight: 600;
}

.preview-section {
  margin: 16px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.preview-header h3 {
  font-size: 16px;
  color: #333;
}

.preview-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  color: #999;
  transition: all 0.2s;
}

.preview-close:active {
  background: #e8e8e8;
}

.preview-image-wrap {
  position: relative;
  max-height: 300px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.preview-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}

.recognize-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 16px;
  background: linear-gradient(145deg, #ff2b3b, #ff4754);
  color: #fff;
  border: none;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  -webkit-tap-highlight-color: transparent;
}

.recognize-btn:active:not(:disabled) {
  opacity: 0.9;
}

.recognize-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result-section {
  margin: 16px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.result-header h3 {
  font-size: 16px;
  color: #333;
}

.result-count {
  font-size: 13px;
  color: #999;
}

.keywords-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.keywords-label {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
}

.keyword-tag {
  display: inline-block;
  padding: 4px 10px;
  background: #ffecee;
  color: #ff2b3b;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.result-notice {
  padding: 10px 16px;
  background: #fffbe6;
  font-size: 13px;
  color: #faad14;
  border-bottom: 1px solid #f0f0f0;
}

.product-list {
  padding: 8px 0;
}

.product-card {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.product-card:active {
  background: #f8f8f8;
}

.product-card + .product-card {
  border-top: 1px solid #f5f5f5;
}

.product-image-wrap {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f5f5f5;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #ff2b3b, #ff4754);
  color: #fff;
  font-size: 24px;
  font-weight: 700;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-brand {
  font-size: 12px;
  color: #999;
  margin-bottom: 2px;
}

.product-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-model {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.product-category {
  display: inline-block;
  padding: 2px 6px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 11px;
  color: #666;
  margin-top: 4px;
}

.product-price-area {
  text-align: right;
  flex-shrink: 0;
}

.price-range {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 2px;
}

.price-max {
  font-size: 20px;
  font-weight: 800;
  color: #ff2b3b;
}

.price-sep {
  font-size: 14px;
  color: #ccc;
}

.price-min {
  font-size: 14px;
  font-weight: 600;
  color: #ff6b7a;
}

.price-none {
  font-size: 14px;
  color: #ccc;
}

.price-conditions {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.error-section {
  margin: 16px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 12px;
  padding: 16px;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.error-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
  font-size: 14px;
  color: #ff4d4f;
}

.error-retry {
  padding: 6px 16px;
  background: #ff2b3b;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}

.error-retry:active {
  opacity: 0.9;
}

.compare-section {
  margin-top: 24px;
}

.compare-title {
  text-align: center;
  font-size: 18px;
  color: #333;
  margin-bottom: 16px;
  padding: 0 16px;
}

.compare-row {
  display: flex;
  gap: 12px;
  padding: 0 16px 16px;
}

.compare-card {
  flex: 1;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.compare-card:active {
  transform: scale(0.98);
}

.card-correct { border: 3px solid #28b940; }
.card-wrong { border: 3px solid #ff2b3b; }

.card-image-wrapper {
  position: relative;
  overflow: hidden;
}

.phone-preview {
  width: 100%;
  display: block;
  transition: transform 0.3s ease;
}

.compare-card:active .phone-preview {
  transform: scale(1.05);
}

.overlay-correct {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(40, 185, 64, 0.1), transparent);
}

.overlay-wrong {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(255, 43, 59, 0.1), transparent);
}

.card-bottom {
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.correct-bottom { background: #e8f9eb; color: #28b940; }
.wrong-bottom { background: #ffeef0; color: #ff2b3b; }

.check-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid currentColor;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  flex-shrink: 0;
}

.card-text {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.quick-search-section {
  margin: 0 16px 16px;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.quick-search-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 12px;
}

.quick-search-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hot-tag {
  display: inline-block;
  padding: 8px 16px;
  background: #f8f8f8;
  border-radius: 20px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.hot-tag:active {
  background: #ffecee;
  color: #ff2b3b;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: #fff;
  display: flex;
  gap: 12px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
  z-index: 50;
}

.action-btn {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.action-btn:active {
  transform: scale(0.98);
}

.action-btn span {
  font-size: 20px;
}

.secondary-btn {
  background: #f5f5f5;
  color: #666;
}

.secondary-btn:active {
  background: #e8e8e8;
}

.primary-btn {
  background: linear-gradient(145deg, #ff2b3b, #ff4754);
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 43, 59, 0.3);
}

.primary-btn:active {
  box-shadow: 0 2px 8px rgba(255, 43, 59, 0.2);
}

.action-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.action-sheet {
  width: 100%;
  max-width: 500px;
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.action-sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  font-size: 17px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.action-sheet-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #999;
  cursor: pointer;
}

.action-sheet-body {
  padding: 8px 0;
}

.action-sheet-item {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 18px 24px;
  background: none;
  border: none;
  font-size: 17px;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.action-sheet-item:active {
  background: #f8f8f8;
}

.action-sheet-icon {
  font-size: 24px;
}

.action-sheet-cancel {
  display: block;
  width: 100%;
  padding: 18px;
  background: none;
  border: none;
  border-top: 8px solid #f5f5f5;
  font-size: 17px;
  color: #999;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.action-sheet-cancel:active {
  background: #f8f8f8;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal-content {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  font-size: 17px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.modal-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #999;
  cursor: pointer;
}

.modal-body {
  padding: 24px;
}

.manual-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s;
}

.manual-input:focus {
  border-color: #ff2b3b;
}

.manual-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.suggestion-tag {
  display: inline-block;
  padding: 6px 12px;
  background: #f5f5f5;
  border-radius: 16px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.suggestion-tag:active {
  background: #ffecee;
  color: #ff2b3b;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px;
}

.modal-btn {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  -webkit-tap-highlight-color: transparent;
}

.modal-btn:active {
  opacity: 0.9;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: linear-gradient(145deg, #ff2b3b, #ff4754);
  color: #fff;
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.history-modal {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.history-modal .modal-body {
  overflow-y: auto;
  flex: 1;
  padding: 16px;
}

.history-empty {
  padding: 40px 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.history-item:active {
  background: #f0f0f0;
}

.history-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #e8e8e8;
}

.history-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.history-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-keywords {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.history-result-count {
  font-size: 13px;
  color: #ff2b3b;
  font-weight: 600;
  flex-shrink: 0;
}

.vip-modal {
  text-align: center;
  padding: 32px 24px;
}

.vip-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.vip-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.vip-desc {
  font-size: 14px;
  color: #999;
  margin-bottom: 24px;
}

.vip-actions {
  display: flex;
  gap: 12px;
}

.vip-btn {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  -webkit-tap-highlight-color: transparent;
}

.vip-btn:active {
  opacity: 0.9;
}

.vip-btn.cancel {
  background: #f5f5f5;
  color: #666;
}

.vip-btn.confirm {
  background: linear-gradient(145deg, #ffd700, #ffb800);
  color: #333;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
}

.slide-up-enter-from .action-sheet,
.slide-up-enter-from .modal-content {
  transform: translateY(100%);
}

.slide-up-leave-to {
  opacity: 0;
}

.slide-up-leave-to .action-sheet,
.slide-up-leave-to .modal-content {
  transform: translateY(100%);
}

.slide-up-enter-to .action-sheet,
.slide-up-enter-to .modal-content,
.slide-up-leave-from .action-sheet,
.slide-up-leave-from .modal-content {
  transform: translateY(0);
}

@media (max-width: 375px) {
  .click-circle {
    width: 160px;
    height: 160px;
  }

  .click-circle::before {
    width: 190px;
    height: 190px;
  }

  .click-text {
    font-size: 22px;
  }

  .camera-icon {
    font-size: 36px;
  }

  .main-title {
    font-size: 28px;
  }

  .count-item .num {
    font-size: 24px;
  }

  .count-item .label {
    font-size: 12px;
  }

  .hand-icon {
    width: 80px;
  }

  .corner-mark {
    width: 24px;
    height: 24px;
    border-width: 3px;
  }

  .digital-tag {
    width: 60px;
    height: 60px;
    font-size: 15px;
    margin-top: -30px;
  }

  .compare-row {
    gap: 10px;
  }

  .card-text {
    font-size: 13px;
  }

  .card-bottom {
    padding: 10px;
  }

  .product-card {
    padding: 10px 12px;
  }

  .product-name {
    font-size: 14px;
  }

  .price-max {
    font-size: 18px;
  }
}

@media (max-width: 320px) {
  .click-circle {
    width: 130px;
    height: 130px;
  }

  .click-circle::before {
    width: 155px;
    height: 155px;
  }

  .click-text {
    font-size: 18px;
  }

  .camera-icon {
    font-size: 30px;
  }

  .main-title {
    font-size: 24px;
  }

  .count-item .num {
    font-size: 20px;
  }

  .count-item .label {
    font-size: 11px;
  }

  .hand-icon {
    width: 60px;
  }

  .corner-mark {
    width: 20px;
    height: 20px;
    border-width: 3px;
  }

  .digital-tag {
    width: 52px;
    height: 52px;
    font-size: 13px;
    margin-top: -26px;
  }

  .click-wrap {
    padding: 36px 16px;
  }

  .main-red-section {
    padding: 20px 16px 60px;
  }

  .compare-row {
    gap: 8px;
  }

  .card-text {
    font-size: 12px;
  }

  .check-circle {
    width: 24px;
    height: 24px;
    font-size: 14px;
  }

  .card-bottom {
    padding: 8px;
    gap: 6px;
  }

  .tip-text {
    font-size: 14px;
    padding: 24px 16px;
  }

  .product-image-wrap {
    width: 48px;
    height: 48px;
  }

  .price-max {
    font-size: 16px;
  }
}
</style>
