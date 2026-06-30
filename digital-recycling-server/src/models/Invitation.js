module.exports = (sequelize, DataTypes) => {
  const Invitation = sequelize.define('Invitation', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    inviter_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '邀请人用户ID'
    },
    invitee_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
      comment: '被邀请人用户ID'
    },
    invite_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '邀请码（冗余存储）'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态: 1=已注册并发放奖励'
    },
    reward_times: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '应发放奖励次数'
    },
    granted_times: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '已发放奖励次数'
    }
  }, {
    tableName: 'invitations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['inviter_id'] },
      { fields: ['invitee_id'], unique: true },
      { fields: ['invite_code'] }
    ]
  })

  return Invitation
}
