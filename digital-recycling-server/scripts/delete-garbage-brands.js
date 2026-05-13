const mysql = require('mysql2/promise');

async function deleteGarbageBrands() {
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

    const garbageIds = [];
    for (let i = 41; i <= 72; i++) {
      garbageIds.push(i);
    }

    console.log(`正在删除 ID 为 ${garbageIds.join(', ')} 的乱码数据...`);
    const placeholders = garbageIds.map(() => '?').join(',');
    const [result] = await connection.execute(
      `DELETE FROM brands WHERE id IN (${placeholders})`,
      garbageIds
    );
    console.log(`已删除 ${result.affectedRows} 条乱码记录`);

    console.log('验证删除结果...');
    const [count] = await connection.execute('SELECT COUNT(*) as total FROM brands');
    console.log(`brands 表现在有 ${count[0].total} 条记录`);

    const [remainingBrands] = await connection.execute('SELECT id, name FROM brands ORDER BY id');
    console.log('\n保留的品牌数据:');
    remainingBrands.forEach(brand => {
      console.log(`  ID ${brand.id}: ${brand.name}`);
    });

  } catch (error) {
    console.error('执行失败:', error.message);
  } finally {
    await connection.end();
  }
}

deleteGarbageBrands();
