module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(50)
    },
    phone: {
      type: DataTypes.STRING(20)
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
    detail: {
      type: DataTypes.STRING(200)
    },
    is_default: {
      type: DataTypes.TINYINT,
      defaultValue: 0
    }
  }, {
    tableName: 'addresses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })
  return Address
}
