module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    type: {
      type: DataTypes.TINYINT
    },
    parent_id: {
      type: DataTypes.BIGINT,
      defaultValue: 0
    },
    path: {
      type: DataTypes.STRING(100)
    },
    icon: {
      type: DataTypes.STRING(50)
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'permissions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  })
  return Permission
}
