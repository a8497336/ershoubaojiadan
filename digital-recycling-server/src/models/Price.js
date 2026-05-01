module.exports = (sequelize, DataTypes) => {
  const Price = sequelize.define('Price', {
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
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    is_available: {
      type: DataTypes.TINYINT,
      defaultValue: 1
    },
    effective_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    tableName: 'prices',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['product_id', 'condition_id', 'effective_date']
      }
    ]
  })
  return Price
}
