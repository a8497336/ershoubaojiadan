module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    order_no: {
      type: DataTypes.STRING(30),
      unique: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'shipping'
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    actual_amount: {
      type: DataTypes.DECIMAL(12, 2)
    },
    receiver_name: {
      type: DataTypes.STRING(50)
    },
    receiver_phone: {
      type: DataTypes.STRING(20)
    },
    receiver_address: {
      type: DataTypes.STRING(300)
    },
    logistics_company: {
      type: DataTypes.STRING(50)
    },
    tracking_no: {
      type: DataTypes.STRING(50)
    },
    logistics_status: {
      type: DataTypes.STRING(20)
    },
    cancel_reason: {
      type: DataTypes.STRING(200)
    },
    paid_at: {
      type: DataTypes.DATE
    },
    completed_at: {
      type: DataTypes.DATE
    },
    cancelled_at: {
      type: DataTypes.DATE
    },
    remark: {
      type: DataTypes.STRING(500)
    }
  }, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })
  return Order
}
