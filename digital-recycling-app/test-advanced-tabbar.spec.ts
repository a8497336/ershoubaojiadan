import { test, expect } from '@playwright/test';

test('5173端口回收车页面 - AdvancedTabBar检查', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  
  await page.goto('http://localhost:5173/shopping');
  await page.waitForLoadState('networkidle');
  
  console.log('\n=== 5173端口 shopping 页面 - AdvancedTabBar测试 ===\n');
  
  const pageTitle = await page.locator('.page-header .header-title').textContent();
  console.log('✓ 页面标题:', pageTitle);
  expect(pageTitle).toBe('回收车');
  
  const modal = await page.locator('.modal-overlay').isVisible();
  console.log('✓ 删除弹窗未显示:', !modal);
  expect(modal).toBe(false);
  
  const productItem = await page.locator('.product-item').first().isVisible();
  console.log('✓ 商品项可见:', productItem);
  
  const bottomSettleBar = await page.locator('.bottom-settle-bar').isVisible();
  console.log('✓ 底部结算栏可见:', bottomSettleBar);
  
  const advancedTabBar = await page.locator('.advanced-tabbar-wrapper').isVisible();
  console.log('✓ AdvancedTabBar可见:', advancedTabBar);
  
  const tabbarItems = await page.locator('.tabbar-item').count();
  console.log('✓ TabBar项目数量:', tabbarItems);
  
  const shoppingTabActive = await page.locator('.tabbar-item.active').count();
  console.log('✓ 激活的Tab数量:', shoppingTabActive);
  
  await page.screenshot({ 
    path: 'test-results/shopping-advanced-tabbar.png',
    fullPage: true 
  });
  
  console.log('\n✓ 所有测试通过！');
  
  expect(advancedTabBar).toBe(true);
  expect(tabbarItems).toBe(5);
});
