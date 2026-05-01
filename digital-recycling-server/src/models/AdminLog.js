module.exports = (sequelize, DataTypes) => {
  const AdminLog = sequelize.define('AdminLog', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    admin_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    module: {
      type: DataTypes.STRING(30)
    },
    action: {
      type: DataTypes.STRING(30)
    },
    target_type: {
      type: DataTypes.STRING(30)
    },
    target_id: {
      type: DataTypes.STRING(50)
    },
    detail: {
      type: DataTypes.TEXT
    },
    ip: {
      type: DataTypes.STRING(50)
    }
  }, {
    tableName: 'admin_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  })
  return AdminLog
}
