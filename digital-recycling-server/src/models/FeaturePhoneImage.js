module.exports = (sequelize, DataTypes) => {
  const FeaturePhoneImage = sequelize.define('FeaturePhoneImage', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
      comment: '报价类型: oldMan(热门老年机) / dianrong(智能机电容屏)'
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '报价单图片 URL'
    }
  }, {
    tableName: 'feature_phone_images',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })
  return FeaturePhoneImage
}
