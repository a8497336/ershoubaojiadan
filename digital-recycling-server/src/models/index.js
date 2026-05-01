const { Sequelize } = require('sequelize')
const dbConfig = require('../config/database')

const sequelize = new Sequelize(
  dbConfig.development.database,
  dbConfig.development.username,
  dbConfig.development.password,
  {
    host: dbConfig.development.host,
    port: dbConfig.development.port,
    dialect: dbConfig.development.dialect,
    logging: dbConfig.development.logging,
    timezone: dbConfig.development.timezone,
    define: dbConfig.development.define,
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000
    }
  }
)

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.User = require('./User')(sequelize, Sequelize)
db.Address = require('./Address')(sequelize, Sequelize)
db.Wallet = require('./Wallet')(sequelize, Sequelize)
db.WalletLog = require('./WalletLog')(sequelize, Sequelize)
db.PointsLog = require('./PointsLog')(sequelize, Sequelize)
db.Category = require('./Category')(sequelize, Sequelize)
db.Brand = require('./Brand')(sequelize, Sequelize)
db.Product = require('./Product')(sequelize, Sequelize)
db.ProductCondition = require('./ProductCondition')(sequelize, Sequelize)
db.Price = require('./Price')(sequelize, Sequelize)
db.PriceHistory = require('./PriceHistory')(sequelize, Sequelize)
db.PriceView = require('./PriceView')(sequelize, Sequelize)
db.Cart = require('./Cart')(sequelize, Sequelize)
db.Order = require('./Order')(sequelize, Sequelize)
db.OrderItem = require('./OrderItem')(sequelize, Sequelize)
db.LogisticsTimeline = require('./LogisticsTimeline')(sequelize, Sequelize)
db.MembershipPlan = require('./MembershipPlan')(sequelize, Sequelize)
db.MembershipOrder = require('./MembershipOrder')(sequelize, Sequelize)
db.Message = require('./Message')(sequelize, Sequelize)
db.Banner = require('./Banner')(sequelize, Sequelize)
db.Announcement = require('./Announcement')(sequelize, Sequelize)
db.Store = require('./Store')(sequelize, Sequelize)
db.Video = require('./Video')(sequelize, Sequelize)
db.Admin = require('./Admin')(sequelize, Sequelize)
db.Role = require('./Role')(sequelize, Sequelize)
db.Permission = require('./Permission')(sequelize, Sequelize)
db.RolePermission = require('./RolePermission')(sequelize, Sequelize)
db.AdminLog = require('./AdminLog')(sequelize, Sequelize)
db.Setting = require('./Setting')(sequelize, Sequelize)
db.UserStock = require('./UserStock')(sequelize, Sequelize)

db.Category.hasMany(db.Brand, { foreignKey: 'category_id', as: 'Brands' })
db.Brand.belongsTo(db.Category, { foreignKey: 'category_id', as: 'Category' })

db.Category.hasMany(db.Product, { foreignKey: 'category_id', as: 'Products' })
db.Product.belongsTo(db.Category, { foreignKey: 'category_id', as: 'Category' })

db.Brand.hasMany(db.Product, { foreignKey: 'brand_id', as: 'Products' })
db.Product.belongsTo(db.Brand, { foreignKey: 'brand_id', as: 'Brand' })

db.Product.hasMany(db.Price, { foreignKey: 'product_id', as: 'Prices' })
db.Price.belongsTo(db.Product, { foreignKey: 'product_id', as: 'Product' })

db.ProductCondition.hasMany(db.Price, { foreignKey: 'condition_id', as: 'Prices' })
db.Price.belongsTo(db.ProductCondition, { foreignKey: 'condition_id', as: 'Condition' })

db.Product.hasMany(db.PriceHistory, { foreignKey: 'product_id', as: 'PriceHistories' })
db.PriceHistory.belongsTo(db.Product, { foreignKey: 'product_id', as: 'Product' })

db.ProductCondition.hasMany(db.PriceHistory, { foreignKey: 'condition_id', as: 'PriceHistories' })
db.PriceHistory.belongsTo(db.ProductCondition, { foreignKey: 'condition_id', as: 'Condition' })

db.User.hasOne(db.Wallet, { foreignKey: 'user_id', as: 'Wallet' })
db.Wallet.belongsTo(db.User, { foreignKey: 'user_id', as: 'User' })

db.User.hasMany(db.Address, { foreignKey: 'user_id', as: 'Addresses' })
db.Address.belongsTo(db.User, { foreignKey: 'user_id', as: 'User' })

db.User.hasMany(db.Cart, { foreignKey: 'user_id', as: 'Carts' })
db.Cart.belongsTo(db.User, { foreignKey: 'user_id', as: 'User' })
db.Cart.belongsTo(db.Product, { foreignKey: 'product_id', as: 'Product' })
db.Cart.belongsTo(db.ProductCondition, { foreignKey: 'condition_id', as: 'Condition' })

db.User.hasMany(db.Order, { foreignKey: 'user_id', as: 'Orders' })
db.Order.belongsTo(db.User, { foreignKey: 'user_id', as: 'User' })

db.Order.hasMany(db.OrderItem, { foreignKey: 'order_id', as: 'Items' })
db.OrderItem.belongsTo(db.Order, { foreignKey: 'order_id', as: 'Order' })

db.Order.hasMany(db.LogisticsTimeline, { foreignKey: 'order_id', as: 'Timelines' })
db.LogisticsTimeline.belongsTo(db.Order, { foreignKey: 'order_id', as: 'Order' })

db.User.hasMany(db.Message, { foreignKey: 'user_id', as: 'Messages' })
db.Message.belongsTo(db.User, { foreignKey: 'user_id', as: 'User' })

db.User.hasMany(db.WalletLog, { foreignKey: 'user_id', as: 'WalletLogs' })
db.WalletLog.belongsTo(db.User, { foreignKey: 'user_id', as: 'User' })

db.User.hasMany(db.PointsLog, { foreignKey: 'user_id', as: 'PointsLogs' })
db.PointsLog.belongsTo(db.User, { foreignKey: 'user_id', as: 'User' })

db.User.hasMany(db.MembershipOrder, { foreignKey: 'user_id', as: 'MembershipOrders' })
db.MembershipOrder.belongsTo(db.User, { foreignKey: 'user_id', as: 'User' })
db.MembershipOrder.belongsTo(db.MembershipPlan, { foreignKey: 'plan_id', as: 'Plan' })

db.MembershipPlan.hasMany(db.MembershipOrder, { foreignKey: 'plan_id', as: 'Orders' })

db.Admin.belongsTo(db.Role, { foreignKey: 'role_id', as: 'Role' })
db.Role.hasMany(db.Admin, { foreignKey: 'role_id', as: 'Admins' })

db.Role.belongsToMany(db.Permission, {
  through: db.RolePermission,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'Permissions'
})
db.Permission.belongsToMany(db.Role, {
  through: db.RolePermission,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'Roles'
})

db.User.hasMany(db.UserStock, { foreignKey: 'user_id', as: 'UserStocks' })
db.UserStock.belongsTo(db.User, { foreignKey: 'user_id', as: 'User' })

db.Product.hasMany(db.UserStock, { foreignKey: 'product_id', as: 'UserStocks' })
db.UserStock.belongsTo(db.Product, { foreignKey: 'product_id', as: 'Product' })

db.ProductCondition.hasMany(db.UserStock, { foreignKey: 'condition_id', as: 'UserStocks' })
db.UserStock.belongsTo(db.ProductCondition, { foreignKey: 'condition_id', as: 'Condition' })

module.exports = db
