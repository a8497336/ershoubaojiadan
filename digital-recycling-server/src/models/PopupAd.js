module.exports = (sequelize, DataTypes) => {
  const PopupAd = sequelize.define('PopupAd', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(100),
      comment: '广告标题'
    },
    popup_type: {
      type: DataTypes.ENUM('local', 'fullscreen'),
      defaultValue: 'local',
      comment: '广告样式: local=局部弹窗, fullscreen=全屏广告'
    },
    images: {
      type: DataTypes.JSON,
      comment: '图片配置数组 [{url, link}]'
    },
    show_frequency: {
      type: DataTypes.ENUM('always', 'first'),
      defaultValue: 'always',
      comment: '弹窗次数: always=每次, first=仅首次'
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
    tableName: 'popup_ads',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })
  return PopupAd
}
