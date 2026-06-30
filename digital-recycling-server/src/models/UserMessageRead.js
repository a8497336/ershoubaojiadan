module.exports = (sequelize, DataTypes) => {
  const UserMessageRead = sequelize.define('UserMessageRead', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    message_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    tableName: 'user_message_reads',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { unique: true, fields: ['user_id', 'message_id'] }
    ]
  })
  return UserMessageRead
}