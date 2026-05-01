const bcrypt = require('bcryptjs')

module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      set(value) {
        this.setDataValue('password', bcrypt.hashSync(value, 10))
      }
    },
    real_name: {
      type: DataTypes.STRING(50)
    },
    phone: {
      type: DataTypes.STRING(20)
    },
    avatar: {
      type: DataTypes.STRING(255)
    },
    role_id: {
      type: DataTypes.BIGINT
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1
    },
    last_login_at: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'admins',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })

  Admin.prototype.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.password)
  }

  return Admin
}
