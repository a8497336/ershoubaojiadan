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
    }
  }, {
    tableName: 'membership_orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })
  return MembershipOrder
}
