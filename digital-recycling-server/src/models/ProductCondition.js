module.exports = (sequelize, DataTypes) => {
  const ProductCondition = sequelize.define('ProductCondition', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(30),
      unique: true
    },
    description: {
      type: DataTypes.STRING(200)
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'product_conditions',
    timestamps: false
  })
  return ProductCondition
}
