module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define('RolePermission', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    role_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    permission_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    tableName: 'role_permissions',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['role_id', 'permission_id']
      }
    ]
  })
  return RolePermission
}
