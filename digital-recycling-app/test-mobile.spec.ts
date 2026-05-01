import { test, expect } from '@playwright/test';

test.describe('移动端页面测试', () => {
  test('拍照查价页面 - 移动端样式检查', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:5174/scan-price');
    await page.waitForLoadState('networkidle');
    
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.screenshot({ 
      path: 'test-results/scanPrice-mobile.png',
      fullPage: true 
    });
    
    const pageTitle = await page.locator('.nav-title').textContent();
    expect(pageTitle).toBe('拍照查价');
    
    const mainTitle = await page.locator('.main-title').textContent();
    expect(mainTitle).toContain('拍照片');
    
    const clickCircle = await page.locator('.click-circle').isVisible();
    expect(clickCircle).toBeTruthy();
    
    console.log('✓ 拍照查价页面测试通过');
    console.log('  - 页面标题正确');
    console.log('  - 主要内容可见');
    console.log('  - 拍照按钮可见');
    
    if (errors.length > 0) {
      console.log('⚠️ 控制台错误:', errors);
    }
  });

  test('回收车页面 - 移动端样式检查', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:5174/shopping');
    await page.waitForLoadState('networkidle');
    
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.screenshot({ 
      path: 'test-results/shopping-mobile.png',
      fullPage: true 
    });
    
    const pageTitle = await page.locator('.page-header .header-title').textContent();
    expect(pageTitle).toBe('回收车');
    
    const productName = await page.locator('.product-name').first().textContent();
    expect(productName).toContain('功能机');
    
    const qtyControl = await page.locator('.qty-control').isVisible();
    expect(qtyControl).toBeTruthy();
    
    const submitBtn = await page.locator('.btn-submit').isVisible();
    expect(submitBtn).toBeTruthy();
    
    console.log('✓ 回收车页面测试通过');
    console.log('  - 页面标题正确');
    console.log('  - 商品信息显示正确');
    console.log('  - 数量控制器可见');
    console.log('  - 提交按钮可见');
    
    if (errors.length > 0) {
      console.log('⚠️ 控制台错误:', errors);
    }
  });

  test('回收车页面 - 交互功能测试', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:5174/shopping');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'test-results/shopping-interaction-before.png',
      fullPage: true 
    });
    
    const initialQty = await page.locator('.qty-num').first().textContent();
    expect(initialQty).toBe('1');
    
    await page.locator('.qty-plus').first().click();
    const afterIncrease = await page.locator('.qty-num').first().textContent();
    expect(afterIncrease).toBe('2');
    
    await page.locator('.qty-minus').first().click();
    const afterDecrease = await page.locator('.qty-num').first().textContent();
    expect(afterDecrease).toBe('1');
    
    await page.screenshot({ 
      path: 'test-results/shopping-interaction-after.png',
      fullPage: true 
    });
    
    console.log('✓ 交互功能测试通过');
    console.log('  - 初始数量: 1');
    console.log('  - 点击加号后: 2');
    console.log('  - 点击减号后: 1');
  });
});
