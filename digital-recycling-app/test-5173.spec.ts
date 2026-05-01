import { test, expect } from '@playwright/test';

test('5173端口回收车页面检查', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  
  await page.goto('http://localhost:5173/shopping');
  await page.waitForLoadState('networkidle');
  
  await page.screenshot({ 
    path: 'test-results/shopping-5173-initial.png',
    fullPage: true 
  });
  
  const pageTitle = await page.locator('.page-header .header-title').textContent();
  console.log('Page title:', pageTitle);
  expect(pageTitle).toBe('回收车');
  
  const modal = await page.locator('.modal-overlay').isVisible();
  console.log('Modal visible:', modal);
  
  const productItem = await page.locator('.product-item').first().isVisible();
  console.log('Product item visible:', productItem);
  
  const bottomSettleBar = await page.locator('.bottom-settle-bar').isVisible();
  console.log('Bottom settle bar visible:', bottomSettleBar);
  
  const bottomNav = await page.locator('.bottom-nav').isVisible();
  console.log('Bottom nav visible:', bottomNav);
  
  console.log('✓ 5173端口回收车页面测试完成');
  
  if (modal) {
    console.log('⚠️ 警告: 删除确认弹窗在初始状态下可见！');
  }
});
