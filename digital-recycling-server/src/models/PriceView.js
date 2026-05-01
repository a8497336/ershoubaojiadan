module.exports = (sequelize, DataTypes) => {
  const PriceView = sequelize.define('PriceView', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    category_id: {
      type: DataTypes.BIGINT
    },
    brand_id: {
      type: DataTypes.BIGINT
    },
    view_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'price_views',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['view_date', 'brand_id', 'category_id']
      }
    ]
  })
  return PriceView
}
