module.exports = (sequelize, DataTypes) => {
  const MembershipPlan = sequelize.define('MembershipPlan', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    key_code: {
      type: DataTypes.STRING(30),
      unique: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    duration_days: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    original_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    subscriber_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1
    }
  }, {
    tableName: 'membership_plans',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })
  return MembershipPlan
}
