import { test, expect } from '@playwright/test';

test('5173端口回收车页面详细检查', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  
  await page.goto('http://localhost:5173/shopping');
  await page.waitForLoadState('networkidle');
  
  console.log('\n=== 5173端口 shopping 页面详细测试 ===\n');
  
  const pageTitle = await page.locator('.page-header .header-title').textContent();
  console.log('✓ 页面标题:', pageTitle);
  
  const topStat = await page.locator('.top-stat').isVisible();
  console.log('✓ 顶部统计栏可见:', topStat);
  
  const categorySection = await page.locator('.category-section').isVisible();
  console.log('✓ 分类区域可见:', categorySection);
  
  const productList = await page.locator('.product-list').isVisible();
  console.log('✓ 商品列表可见:', productList);
  
  const productItems = await page.locator('.product-item').count();
  console.log('✓ 商品数量:', productItems);
  
  const qtyControl = await page.locator('.qty-control').isVisible();
  console.log('✓ 数量控制器可见:', qtyControl);
  
  const tipText = await page.locator('.tip-text').isVisible();
  console.log('✓ 提示文字可见:', tipText);
  
  const bottomSettleBar = await page.locator('.bottom-settle-bar').isVisible();
  console.log('✓ 底部结算栏可见:', bottomSettleBar);
  
  const submitBtn = await page.locator('.btn-submit').isVisible();
  console.log('✓ 提交按钮可见:', submitBtn);
  
  const modal = await page.locator('.modal-overlay').isVisible();
  console.log('✓ 删除弹窗可见:', modal);
  
  const bottomNav = await page.locator('.bottom-nav').isVisible();
  console.log('✓ 底部导航栏可见:', bottomNav);
  
  const navItems = await page.locator('.nav-item').count();
  console.log('✓ 导航项数量:', navItems);
  
  await page.screenshot({ 
    path: 'test-results/shopping-5173-detailed.png',
    fullPage: true 
  });
  
  console.log('\n=== 检查 CSS 样式 ===\n');
  
  const bottomNavStyle = await page.locator('.bottom-nav').evaluate(el => {
    const styles = window.getComputedStyle(el);
    return {
      position: styles.position,
      bottom: styles.bottom,
      height: styles.height,
      zIndex: styles.zIndex,
      background: styles.background
    };
  });
  console.log('底部导航栏样式:', bottomNavStyle);
  
  console.log('\n=== 页面布局测试 ===\n');
  
  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  const windowHeight = await page.evaluate(() => window.innerHeight);
  console.log('页面总高度:', bodyHeight);
  console.log('视窗高度:', windowHeight);
  
  const bottomNavBox = await page.locator('.bottom-nav').boundingBox();
  console.log('底部导航栏位置:', bottomNavBox);
  
  console.log('\n✓ 测试完成！');
});
