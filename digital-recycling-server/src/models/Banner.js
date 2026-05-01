module.exports = (sequelize, DataTypes) => {
  const Banner = sequelize.define('Banner', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(100)
    },
    subtitle: {
      type: DataTypes.STRING(100)
    },
    image: {
      type: DataTypes.STRING(255)
    },
    link_type: {
      type: DataTypes.STRING(20)
    },
    link_url: {
      type: DataTypes.STRING(255)
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1
    },
    start_time: {
      type: DataTypes.DATE
    },
    end_time: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'banners',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })
  return Banner
}
