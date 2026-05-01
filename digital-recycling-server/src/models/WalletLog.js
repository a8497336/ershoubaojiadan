module.exports = (sequelize, DataTypes) => {
  const WalletLog = sequelize.define('WalletLog', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    type: {
      type: DataTypes.TINYINT
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    balance_after: {
      type: DataTypes.DECIMAL(12, 2)
    },
    source: {
      type: DataTypes.STRING(30)
    },
    source_id: {
      type: DataTypes.STRING(50)
    },
    remark: {
      type: DataTypes.STRING(200)
    }
  }, {
    tableName: 'wallet_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  })
  return WalletLog
}
