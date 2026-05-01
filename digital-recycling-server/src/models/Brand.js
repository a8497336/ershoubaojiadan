module.exports = (sequelize, DataTypes) => {
  const Brand = sequelize.define('Brand', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    category_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(30)
    },
    icon: {
      type: DataTypes.STRING(255)
    },
    bg_color: {
      type: DataTypes.STRING(20)
    },
    icon_text: {
      type: DataTypes.STRING(20)
    },
    icon_style: {
      type: DataTypes.STRING(100)
    },
    has_update: {
      type: DataTypes.TINYINT,
      defaultValue: 1
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1
    },
    quote_title: {
      type: DataTypes.STRING(100)
    },
    quote_view_count: {
      type: DataTypes.STRING(20)
    },
    quote_receiver_name: {
      type: DataTypes.STRING(50)
    },
    quote_receiver_phone: {
      type: DataTypes.STRING(20)
    },
    quote_receiver_address: {
      type: DataTypes.TEXT
    },
    quote_rules: {
      type: DataTypes.TEXT
    },
    quote_footer_notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'brands',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })
  return Brand
}
