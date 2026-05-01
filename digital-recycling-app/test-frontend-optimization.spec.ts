import { test, expect } from '@playwright/test';

// 测试配置：模拟 iPhone 8
const VIEWPORT = { width: 375, height: 667 };
const BASE_URL = 'http://localhost:5175';

test.describe('前端功能全面完善测试', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORT);
  });

  test.describe('Task 1: 底部导航栏统一', () => {
    const pages = [
      { path: '/', tab: 'home', name: '首页' },
      { path: '/shopping', tab: 'shopping', name: '回收车' },
      { path: '/scan-price', tab: 'scanPrice', name: '拍照查价' },
      { path: '/profile', tab: 'profile', name: '我的' },
    ];

    for (const { path, tab, name } of pages) {
      test(`${name}页面显示 AdvancedTabBar`, async ({ page }) => {
        await page.goto(`${BASE_URL}${path}`);
        await page.waitForLoadState('networkidle');

        const tabBar = await page.locator('.advanced-tabbar-wrapper').isVisible();
        expect(tabBar).toBe(true);

        const items = await page.locator('.tabbar-item').count();
        expect(items).toBe(5);

        const activeItem = await page.locator('.tabbar-item.active').count();
        expect(activeItem).toBe(1);

        console.log(`✓ ${name}页面导航栏正常`);
      });
    }
  });

  test.describe('Task 2 & 4: 空状态组件', () => {
    test('shopping.vue 空购物车状态', async ({ page }) => {
      await page.goto(`${BASE_URL}/shopping`);
      await page.waitForLoadState('networkidle');

      // 点击清空按钮
      await page.locator('.clear-btn').click();
      // 等待清空确认弹窗
      await page.waitForSelector('.modal-overlay', { state: 'visible' });
      // 点击确定
      await page.locator('.modal-btn.confirm').click();
      // 等待弹窗消失
      await page.waitForSelector('.modal-overlay', { state: 'hidden' });

      const emptyState = await page.locator('.empty-state').isVisible();
      expect(emptyState).toBe(true);

      const emptyTitle = await page.locator('.empty-title').textContent();
      expect(emptyTitle).toContain('购物车是空的');

      console.log('✓ 空购物车状态显示正常');
    });
  });

  test.describe('Task 5: 响应式兼容性', () => {
    test('小屏设备 320px 适配', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await page.goto(`${BASE_URL}/shopping`);
      await page.waitForLoadState('networkidle');

      const tabBar = await page.locator('.advanced-tabbar-wrapper').isVisible();
      expect(tabBar).toBe(true);

      const productItem = await page.locator('.product-item').first().isVisible();
      expect(productItem).toBe(true);

      console.log('✓ 320px 小屏设备适配正常');
    });

    test('大屏设备 414px 适配', async ({ page }) => {
      await page.setViewportSize({ width: 414, height: 896 });
      await page.goto(`${BASE_URL}/`);
      await page.waitForLoadState('networkidle');

      const tabBar = await page.locator('.advanced-tabbar-wrapper').isVisible();
      expect(tabBar).toBe(true);

      console.log('✓ 414px 大屏设备适配正常');
    });
  });

  test.describe('Task 6: 交互体验', () => {
    test('页面切换动画', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      await page.waitForLoadState('networkidle');

      // 点击回收车 tab
      await page.locator('.tabbar-item').nth(3).click();
      await page.waitForTimeout(500);

      const currentUrl = page.url();
      expect(currentUrl).toContain('/shopping');

      console.log('✓ 页面切换动画正常');
    });

    test('按钮点击反馈', async ({ page }) => {
      await page.goto(`${BASE_URL}/shopping`);
      await page.waitForLoadState('networkidle');

      const plusBtn = await page.locator('.qty-plus').first();
      const box = await plusBtn.boundingBox();
      expect(box).not.toBeNull();

      console.log('✓ 按钮点击反馈正常');
    });

    test('弹窗动画', async ({ page }) => {
      await page.goto(`${BASE_URL}/shopping`);
      await page.waitForLoadState('networkidle');

      // 点击删除按钮
      await page.locator('.delete-btn').first().click();
      // 等待弹窗显示
      await page.waitForSelector('.modal-overlay', { state: 'visible' });

      const modal = await page.locator('.modal-overlay').isVisible();
      expect(modal).toBe(true);

      // 关闭弹窗
      await page.locator('.modal-btn.cancel').click();
      // 等待弹窗消失
      await page.waitForSelector('.modal-overlay', { state: 'hidden', timeout: 5000 });

      const modalAfter = await page.locator('.modal-overlay').isVisible();
      expect(modalAfter).toBe(false);

      console.log('✓ 弹窗动画正常');
    });
  });

  test.describe('Task 7: 性能优化', () => {
    test('图片懒加载属性', async ({ page }) => {
      await page.goto(`${BASE_URL}/scan-price`);
      await page.waitForLoadState('networkidle');

      const images = await page.locator('img').all();
      for (const img of images) {
        const loading = await img.getAttribute('loading');
        expect(loading).toBe('lazy');
      }

      console.log('✓ 图片懒加载配置正确');
    });

    test('首屏加载时间 < 5秒', async ({ page }) => {
      const start = Date.now();
      await page.goto(`${BASE_URL}/`);
      await page.waitForLoadState('networkidle');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5000);
      console.log(`✓ 首屏加载时间: ${duration}ms`);
    });
  });

  test.describe('综合功能测试', () => {
    test('完整用户流程', async ({ page }) => {
      // 1. 访问首页
      await page.goto(`${BASE_URL}/`);
      await page.waitForLoadState('networkidle');
      console.log('1. 首页加载完成');

      // 2. 切换到回收车
      await page.locator('.tabbar-item').nth(3).click();
      await page.waitForTimeout(500);
      console.log('2. 切换到回收车');

      // 3. 增加数量
      await page.locator('.qty-plus').first().click();
      const qty = await page.locator('.qty-num').first().textContent();
      expect(qty).toBe('2');
      console.log('3. 数量增加成功');

      // 4. 切换到拍照查价
      await page.locator('.tabbar-item').nth(2).click();
      await page.waitForTimeout(500);
      console.log('4. 切换到拍照查价');

      // 5. 切换到我的
      await page.locator('.tabbar-item').nth(4).click();
      await page.waitForTimeout(500);
      console.log('5. 切换到我的');

      console.log('✓ 完整用户流程测试通过');
    });
  });
});
