const mysql = require('mysql2/promise');

async function deleteProducts() {
  const connection = await mysql.createConnection({
    host: '82.158.88.128',
    port: 3306,
    user: 'ershouhuishou',
    password: 'hBSQDaSsnRBKFkJE',
    database: 'ershouhuishou'
  });

  try {
    console.log('正在连接数据库...');
    await connection.connect();
    console.log('已连接');

    console.log('正在删除 products 表数据...');
    const [result] = await connection.execute('DELETE FROM products');
    console.log(`已删除 ${result.affectedRows} 条记录`);

    console.log('验证删除结果...');
    const [count] = await connection.execute('SELECT COUNT(*) as total FROM products');
    console.log(`products 表现在有 ${count[0].total} 条记录`);

  } catch (error) {
    console.error('执行失败:', error.message);
  } finally {
    await connection.end();
  }
}

deleteProducts();
