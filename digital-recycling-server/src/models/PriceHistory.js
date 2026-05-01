module.exports = (sequelize, DataTypes) => {
  const PriceHistory = sequelize.define('PriceHistory', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    product_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    condition_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    old_price: {
      type: DataTypes.DECIMAL(10, 2)
    },
    new_price: {
      type: DataTypes.DECIMAL(10, 2)
    },
    change_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    tableName: 'price_histories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  })
  return PriceHistory
}
