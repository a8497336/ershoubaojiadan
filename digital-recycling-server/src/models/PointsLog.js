module.exports = (sequelize, DataTypes) => {
  const PointsLog = sequelize.define('PointsLog', {
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
    points: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    balance_after: {
      type: DataTypes.INTEGER
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
    tableName: 'points_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  })
  return PointsLog
}
