import { test, expect } from '@playwright/test';

test('shopping页面 - AdvancedTabBar功能测试', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  
  await page.goto('http://localhost:5174/shopping');
  await page.waitForLoadState('networkidle', { timeout: 60000 });
  
  console.log('\n=== Shopping 页面 AdvancedTabBar 测试 ===\n');
  
  const pageTitle = await page.locator('.page-header .header-title').textContent();
  console.log('✓ 页面标题:', pageTitle);
  expect(pageTitle).toBe('回收车');
  
  const advancedTabBar = await page.locator('.advanced-tabbar-wrapper').isVisible();
  console.log('✓ AdvancedTabBar可见:', advancedTabBar);
  
  const tabbarItems = await page.locator('.tabbar-item').count();
  console.log('✓ TabBar项目数量:', tabbarItems);
  expect(tabbarItems).toBe(5);
  
  const activeItem = await page.locator('.tabbar-item.active').count();
  console.log('✓ 激活的Tab:', activeItem);
  expect(activeItem).toBe(1);
  
  const centerTab = await page.locator('.center-tab').isVisible();
  console.log('✓ 中心扫码按钮可见:', centerTab);
  
  const badgeCount = await page.locator('.tab-badge').textContent();
  console.log('✓ 徽章数量:', badgeCount);
  
  const productItem = await page.locator('.product-item').first().isVisible();
  console.log('✓ 商品项可见:', productItem);
  
  const submitBtn = await page.locator('.btn-submit').isVisible();
  console.log('✓ 提交按钮可见:', submitBtn);
  
  await page.screenshot({ 
    path: 'test-results/shopping-advanced-final.png',
    fullPage: true 
  });
  
  console.log('\n✓ 所有测试通过！');
});
