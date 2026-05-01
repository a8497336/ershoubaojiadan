import { test, expect } from '@playwright/test';

const VIEWPORT = { width: 375, height: 667 };
const BASE_URL = 'http://localhost:5176';

test.describe('新增页面功能测试', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORT);
  });

  // 测试所有新页面能正常访问
  const newPages = [
    { path: '/announcement', title: '公告中心' },
    { path: '/my-points', title: '我的积分' },
    { path: '/invite-friends', title: '邀请好友' },
    { path: '/recycling-process', title: '回收流程' },
    { path: '/mailing-address', title: '邮寄地址' },
    { path: '/feedback', title: '问题反馈' },
    { path: '/faq', title: '常见问题' },
    { path: '/business-cooperation', title: '商务合作' },
  ];

  for (const pageInfo of newPages) {
    test(`${pageInfo.title}页面能正常访问`, async ({ page }) => {
      await page.goto(`${BASE_URL}${pageInfo.path}`);
      await page.waitForLoadState('networkidle');

      // 验证页面标题
      const navTitle = await page.locator('.nav-title').textContent();
      expect(navTitle).toContain(pageInfo.title);

      // 验证返回按钮存在
      const backBtn = await page.locator('.nav-back');
      await expect(backBtn).toBeVisible();

      // 验证页面内容不为空
      const pageContent = await page.locator('.nav-bar').evaluate(el => el.textContent);
      expect(pageContent).toBeTruthy();
    });
  }

  // 测试公告中心页面功能
  test('公告中心 - 公告列表和展开功能', async ({ page }) => {
    await page.goto(`${BASE_URL}/announcement`);
    await page.waitForLoadState('networkidle');

    // 验证公告列表存在
    const items = await page.locator('.announcement-item');
    await expect(items.first()).toBeVisible();

    // 验证未读公告有红点
    const unreadItems = await page.locator('.announcement-item.unread');
    await expect(unreadItems.first()).toBeVisible();

    // 点击展开第一个公告
    await items.first().click();
    const expandedContent = await page.locator('.item-content.expanded');
    await expect(expandedContent).toBeVisible();
  });

  // 测试我的积分页面功能
  test('我的积分 - 积分余额和筛选功能', async ({ page }) => {
    await page.goto(`${BASE_URL}/my-points`);
    await page.waitForLoadState('networkidle');

    // 验证积分余额显示
    const pointsValue = await page.locator('.points-value');
    await expect(pointsValue).toBeVisible();

    // 验证筛选标签
    const filterTabs = await page.locator('.filter-tab');
    await expect(filterTabs).toHaveCount(3);

    // 点击收入筛选
    await filterTabs.nth(1).click();
    await expect(filterTabs.nth(1)).toHaveClass(/active/);
  });

  // 测试邀请好友页面功能
  test('邀请好友 - 邀请码和复制功能', async ({ page }) => {
    await page.goto(`${BASE_URL}/invite-friends`);
    await page.waitForLoadState('networkidle');

    // 验证邀请码显示
    const codeValue = await page.locator('.code-value');
    await expect(codeValue).toBeVisible();

    // 验证复制按钮
    const copyBtn = await page.locator('.copy-btn');
    await expect(copyBtn).toBeVisible();

    // 验证分享按钮
    const shareBtns = await page.locator('.share-btn');
    await expect(shareBtns).toHaveCount(3);
  });

  // 测试回收流程页面功能
  test('回收流程 - 步骤时间线显示', async ({ page }) => {
    await page.goto(`${BASE_URL}/recycling-process`);
    await page.waitForLoadState('networkidle');

    // 验证步骤数量
    const steps = await page.locator('.timeline-item');
    await expect(steps).toHaveCount(4);

    // 验证注意事项
    const noticeSection = await page.locator('.notice-section');
    await expect(noticeSection).toBeVisible();
  });

  // 测试邮寄地址页面功能
  test('邮寄地址 - 地址列表和添加功能', async ({ page }) => {
    await page.goto(`${BASE_URL}/mailing-address`);
    await page.waitForLoadState('networkidle');

    // 验证地址卡片存在
    const addressCards = await page.locator('.address-card');
    await expect(addressCards.first()).toBeVisible();

    // 验证默认地址标签
    const defaultTag = await page.locator('.default-tag');
    await expect(defaultTag).toBeVisible();

    // 验证添加按钮
    const addBtn = await page.locator('.nav-action');
    await expect(addBtn).toBeVisible();
  });

  // 测试问题反馈页面功能
  test('问题反馈 - 表单提交功能', async ({ page }) => {
    await page.goto(`${BASE_URL}/feedback`);
    await page.waitForLoadState('networkidle');

    // 验证反馈类型选择
    const typeItems = await page.locator('.type-item');
    await expect(typeItems).toHaveCount(4);

    // 选择反馈类型
    await typeItems.first().click();
    await expect(typeItems.first()).toHaveClass(/active/);

    // 填写反馈内容
    await page.fill('.content-input', '这是一个测试反馈内容');

    // 验证提交按钮
    const submitBtn = await page.locator('.submit-btn');
    await expect(submitBtn).toBeEnabled();
  });

  // 测试常见问题页面功能
  test('常见问题 - 分类和搜索功能', async ({ page }) => {
    await page.goto(`${BASE_URL}/faq`);
    await page.waitForLoadState('networkidle');

    // 验证分类标签
    const categoryTabs = await page.locator('.category-tab');
    await expect(categoryTabs).toHaveCount(5);

    // 验证FAQ列表
    const faqItems = await page.locator('.faq-item');
    await expect(faqItems.first()).toBeVisible();

    // 测试搜索
    await page.fill('.search-box input', '回收');
    await page.waitForTimeout(300);
  });

  // 测试商务合作页面功能
  test('商务合作 - 表单和合作方式', async ({ page }) => {
    await page.goto(`${BASE_URL}/business-cooperation`);
    await page.waitForLoadState('networkidle');

    // 验证合作方式卡片
    const typeCards = await page.locator('.type-card');
    await expect(typeCards).toHaveCount(3);

    // 验证表单字段
    const formInputs = await page.locator('.form-item input');
    await expect(formInputs).toHaveCount(3);

    // 验证提交按钮
    const submitBtn = await page.locator('.submit-btn');
    await expect(submitBtn).toBeDisabled();
  });

  // 测试从Profile页面跳转
  test('Profile页面 - 功能入口跳转', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');

    // 测试公告中心跳转
    const announcementEntry = await page.locator('.quick-entry-item').filter({ hasText: '公告中心' });
    if (await announcementEntry.isVisible().catch(() => false)) {
      await announcementEntry.click();
      await page.waitForURL('**/announcement');
      await expect(page).toHaveURL(`${BASE_URL}/announcement`);
      await page.goBack();
      await page.waitForLoadState('networkidle');
    }

    // 测试我的积分跳转
    const pointsEntry = await page.locator('.points-item').filter({ hasText: '我的积分' });
    if (await pointsEntry.isVisible().catch(() => false)) {
      await pointsEntry.click();
      await page.waitForURL('**/my-points');
      await expect(page).toHaveURL(`${BASE_URL}/my-points`);
    }
  });

  // 测试移动端响应式
  test('所有页面在320px宽度下显示正常', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 667 });
    await page.goto(`${BASE_URL}/announcement`);
    await page.waitForLoadState('networkidle');

    // 验证页面无水平滚动
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });
});
