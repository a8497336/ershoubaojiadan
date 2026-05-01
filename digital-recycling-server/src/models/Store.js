module.exports = (sequelize, DataTypes) => {
  const Store = sequelize.define('Store', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    contact_name: {
      type: DataTypes.STRING(50)
    },
    contact_phone: {
      type: DataTypes.STRING(20)
    },
    wechat: {
      type: DataTypes.STRING(50)
    },
    province: {
      type: DataTypes.STRING(30)
    },
    city: {
      type: DataTypes.STRING(30)
    },
    district: {
      type: DataTypes.STRING(30)
    },
    address: {
      type: DataTypes.STRING(300)
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7)
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7)
    },
    business_hours: {
      type: DataTypes.STRING(100)
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1
    }
  }, {
    tableName: 'stores',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })
  return Store
}
