/**
 * dom(Demo)项目专用路由聚合
 * 独立于主小程序 API(src/routes/api),不影响现有接口
 * 挂载点:src/app.js → app.use('/api/dom', require('./routes/dom'))
 */
const router = require('express').Router()

/**
 * @openapi
 * tags:
 *   - name: dom-虚拟支付
 *     description: dom(Demo)项目专用虚拟支付测试接口(独立于主小程序)
 */

router.use('/virtual-pay', require('./virtual-pay'))

module.exports = router
