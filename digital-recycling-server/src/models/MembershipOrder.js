module.exports = (sequelize, DataTypes) => {
  const MembershipOrder = sequelize.define('MembershipOrder', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    plan_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    order_no: {
      type: DataTypes.STRING(30),
      unique: true
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    pay_method: {
      type: DataTypes.STRING(20)
    },
    pay_status: {
      type: DataTypes.TINYINT,
      defaultValue: 0
    },
    pay_time: {
      type: DataTypes.DATE
    },
    start_date: {
      type: DataTypes.DATEONLY
    },
    end_date: {
      type: DataTypes.DATEONLY
    },
    transaction_id: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: '微信支付订单号(由微信虚拟支付回调写入,用于对账)'
    },
    prepay_id: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: '微信支付预支付会话 ID(unifiedorder 返回,用于查单)'
    }
  }, {
    tableName: 'membership_orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })
  return MembershipOrder
}
