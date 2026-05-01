module.exports = (sequelize, DataTypes) => {
  const Setting = sequelize.define('Setting', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    key: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    value: {
      type: DataTypes.TEXT
    },
    description: {
      type: DataTypes.STRING(200)
    }
  }, {
    tableName: 'settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })
  return Setting
}
