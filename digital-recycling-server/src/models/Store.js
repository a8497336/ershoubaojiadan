const { geocodeStore } = require('../utils/qqmap')
const logger = require('../utils/logger')

const ADDRESS_FIELDS = ['province', 'city', 'district', 'address']

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
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (store, options) => {
        if (options && options.autoGeocode === false) return
        const hasLatLng = store.latitude !== null && store.latitude !== undefined &&
                          store.longitude !== null && store.longitude !== undefined
        if (hasLatLng) return
        const coords = await geocodeStore(store)
        if (coords) {
          store.latitude = coords.lat
          store.longitude = coords.lng
          logger.info('[Store] beforeCreate 自动 geocode', { id: store.id, name: store.name, lat: coords.lat, lng: coords.lng })
        } else {
          logger.warn('[Store] beforeCreate geocode 失败', { name: store.name })
        }
      },
      beforeUpdate: async (store, options) => {
        if (options && options.autoGeocode === false) return
        const changed = ADDRESS_FIELDS.some(f => store.changed(f))
        if (!changed) return
        const coords = await geocodeStore(store)
        if (coords) {
          store.latitude = coords.lat
          store.longitude = coords.lng
          logger.info('[Store] beforeUpdate 自动 geocode', { id: store.id, name: store.name, lat: coords.lat, lng: coords.lng })
        } else {
          logger.warn('[Store] beforeUpdate geocode 失败', { name: store.name })
        }
      }
    }
  })
  return Store
}
