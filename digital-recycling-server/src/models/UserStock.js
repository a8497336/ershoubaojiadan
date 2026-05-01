'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserStock = sequelize.define('UserStock', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'user_id'
    },
    productId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'product_id'
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false
    },
    purchasePrice: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'purchase_price',
      comment: '购入价格'
    },
    conditionId: {
      type: DataTypes.BIGINT,
      field: 'condition_id',
      comment: '成色ID'
    },
    note: {
      type: DataTypes.STRING(500),
      comment: '备注'
    },
    isSold: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_sold',
      comment: '是否已卖出'
    },
    soldPrice: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'sold_price',
      comment: '卖出价格'
    },
    soldAt: {
      type: DataTypes.DATE,
      field: 'sold_at',
      comment: '卖出时间'
    }
  }, {
    tableName: 'user_stock',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return UserStock;
};
