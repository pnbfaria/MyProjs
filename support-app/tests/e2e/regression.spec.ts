import { test, expect } from '@playwright/test';

test.describe('SupportApp Regression Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Ensuring the app is accessible at port 4205. 
    await page.goto('/');
  });

  test('Dashboard loads with SLA performance KPIs', async ({ page }) => {
    await expect(page.locator('h2.page-title')).toContainText('SLA Performance Overview');
    
    // Check for essential KPI cards
    await expect(page.locator('.kpi-card')).toHaveCount(6);
    await expect(page.locator('.kpi-label')).toContainText(['SLA Compliance Rate', 'Total Incidents']);
    
    // Check Recent Incidents table
    await expect(page.locator('h3.card-title')).toContainText('Recent Incidents');
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('Sidebar branding follows Fujitsu identity', async ({ page }) => {
    const sidebarLogo = page.locator('.sidebar-logo');
    await expect(sidebarLogo).toBeVisible();
    
    // Check official Fujitsu logo image
    const logoImg = sidebarLogo.locator('img');
    await expect(logoImg).toHaveAttribute('src', '/fujitsu-logo.png');
    
    // Check "Support Hub" text
    await expect(sidebarLogo).toContainText('Support Hub');
  });

  test('Navigation to Incident Tickets and Filter functionality', async ({ page }) => {
    await page.click('a[href="/tickets"]');
    await expect(page).toHaveURL(/\/tickets/);
    await expect(page.locator('h2.page-title')).toContainText('Incident Tickets');
    
    // Verify tickets are displayed
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();
    await expect(rows).not.toHaveCount(0);
    
    // Check if Jira links use standard Red highlight
    const firstKey = rows.first().locator('td').first().locator('a');
    await expect(firstKey).toHaveCSS('color', 'rgb(230, 0, 18)'); // Fujitsu Red
  });

  test('Alerts view loads correctly', async ({ page }) => {
    await page.click('a[href="/alerts"]');
    await expect(page).toHaveURL(/\/alerts/);
    await expect(page.locator('h2.page-title')).toContainText('Deviation Alerts');
  });

  test('Settings Page can perform diagnostic checks', async ({ page }) => {
    await page.click('a[href="/settings"]');
    await expect(page).toHaveURL(/\/settings/);
    
    const connectivityBtn = page.locator('button:has-text("Refresh")');
    await expect(connectivityBtn).toBeVisible();
    
    const syncBtn = page.locator('button:has-text("Sync Now")');
    await expect(syncBtn).toBeVisible();
  });

});
