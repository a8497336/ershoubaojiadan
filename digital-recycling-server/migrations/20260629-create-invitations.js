'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('invitations', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      inviter_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: '邀请人用户ID'
      },
      invitee_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
        comment: '被邀请人用户ID'
      },
      invite_code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: '邀请码（冗余存储）'
      },
      status: {
        type: Sequelize.TINYINT,
        defaultValue: 1,
        comment: '状态: 1=已注册并发放奖励'
      },
      reward_times: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: '应发放奖励次数'
      },
      granted_times: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: '已发放奖励次数'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    })

    await queryInterface.addIndex('invitations', ['inviter_id'])
    await queryInterface.addIndex('invitations', ['invite_code'])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('invitations')
  }
}
