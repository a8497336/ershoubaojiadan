module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    openid: {
      type: DataTypes.STRING(64),
      unique: true
    },
    union_id: {
      type: DataTypes.STRING(64)
    },
    phone: {
      type: DataTypes.STRING(20)
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      defaultValue: null
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      defaultValue: null
    },
    nickname: {
      type: DataTypes.STRING(50)
    },
    avatar: {
      type: DataTypes.STRING(255)
    },
    user_no: {
      type: DataTypes.STRING(20),
      unique: true
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    scan_remaining: {
      type: DataTypes.INTEGER,
      defaultValue: 10
    },
    quote_remaining: {
      type: DataTypes.INTEGER,
      defaultValue: 100
    },
    quote_daily_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    quote_daily_date: {
      type: DataTypes.DATEONLY
    },
    membership_id: {
      type: DataTypes.BIGINT
    },
    membership_expire: {
      type: DataTypes.DATE
    },
    total_recycled: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0
    },
    co2_saved: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1
    },
    last_login_at: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })

  return User
}
