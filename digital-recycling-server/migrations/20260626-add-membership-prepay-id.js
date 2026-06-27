/**
 * 数据库迁移: 会员订单新增 prepay_id 字段(微信支付 V2 JSAPI 下单返回)
 *
 * 执行:
 *   npx sequelize-cli db:migrate
 * 回滚:
 *   npx sequelize-cli db:migrate:undo --name 20260626-add-membership-prepay-id
 */
'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('membership_orders', 'prepay_id', {
      type: Sequelize.STRING(64),
      allowNull: true,
      comment: '微信支付预支付会话 ID(unifiedorder 返回,用于查单)'
    })
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('membership_orders', 'prepay_id')
  }
}
