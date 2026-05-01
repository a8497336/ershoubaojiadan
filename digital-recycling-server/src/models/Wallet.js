module.exports = (sequelize, DataTypes) => {
  const Wallet = sequelize.define('Wallet', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      unique: true,
      allowNull: false
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0
    },
    frozen: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0
    },
    total_income: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0
    },
    total_withdraw: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0
    }
  }, {
    tableName: 'wallets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })
  return Wallet
}
