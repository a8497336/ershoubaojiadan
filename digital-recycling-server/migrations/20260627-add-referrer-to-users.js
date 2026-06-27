'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'referrer', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: '推荐人'
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'referrer')
  }
}
