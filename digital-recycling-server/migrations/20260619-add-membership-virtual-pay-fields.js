/**
 * 数据库迁移: 接入微信小程序虚拟支付 — MembershipPlan 加 product_id + MembershipOrder 加 transaction_id
 *
 * 执行:
 *   npx sequelize-cli db:migrate
 * 回滚:
 *   npx sequelize-cli db:migrate:undo --name 20260619-add-membership-virtual-pay-fields
 */
'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // MembershipPlan 加 product_id
    await queryInterface.addColumn('membership_plans', 'product_id', {
      type: Sequelize.STRING(64),
      allowNull: true,
      comment: '微信小程序虚拟支付商品 ID(从 MP 后台虚拟支付 → 商品管理获取)'
    })

    // MembershipOrder 加 transaction_id
    await queryInterface.addColumn('membership_orders', 'transaction_id', {
      type: Sequelize.STRING(64),
      allowNull: true,
      comment: '微信支付订单号(由微信虚拟支付回调写入,用于对账)'
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('membership_orders', 'transaction_id')
    await queryInterface.removeColumn('membership_plans', 'product_id')
  }
}
