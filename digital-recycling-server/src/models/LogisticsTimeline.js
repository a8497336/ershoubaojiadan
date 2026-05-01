module.exports = (sequelize, DataTypes) => {
  const LogisticsTimeline = sequelize.define('LogisticsTimeline', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(200)
    },
    happened_at: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'logistics_timelines',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  })
  return LogisticsTimeline
}
