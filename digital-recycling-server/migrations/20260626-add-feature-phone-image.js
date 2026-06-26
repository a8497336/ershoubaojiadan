/**
 * 数据库迁移: 新增 feature_phone_images 表
 *   用于存储"热门老年机(oldMan)"与"智能机电容屏(dianrong)"两种报价单图片 URL
 *
 * 执行:
 *   npx sequelize-cli db:migrate
 * 回滚:
 *   npx sequelize-cli db:migrate:undo --name 20260626-add-feature-phone-image
 */
'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('feature_phone_images', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      type: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        comment: '报价类型: oldMan(热门老年机) / dianrong(智能机电容屏)'
      },
      image: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: '报价单图片 URL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('feature_phone_images')
  }
}
