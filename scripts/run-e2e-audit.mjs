import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:\\Users\\Windows\\.gemini\\antigravity\\brain\\170c9ef3-436e-4247-947f-4dbd79f1e60f\\screenshots';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const API_URL = 'https://yjdlz1pnwl.execute-api.us-east-1.amazonaws.com';
const BASE_URL = 'http://localhost:4173';

const results = [];

function recordResult(testName, action, expected, actual, status, screenshotPath = '') {
  results.push({ testName, action, expected, actual, status, screenshotPath });
  console.log(`[${status}] ${testName} -> ${action}: ${actual}`);
}

/**
 * Dismisses the "Choose Language" modal if present without triggering destructive page reload
 */
async function dismissLanguageModalIfPresent(page) {
  try {
    const isModalOpen = await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Choose Language'));
      if (heading) {
        localStorage.setItem('languageSelected', 'en');
        const overlay = heading.closest('.fixed.inset-0') || heading.closest('.fixed');
        if (overlay) overlay.remove();
        return true;
      }
      return false;
    });

    if (isModalOpen) {
      console.log('Language modal detected on public page -> Cleanly dismissed for testing.');
      await new Promise(r => setTimeout(r, 400));
    }
  } catch (err) {
    console.log('Error dismissing language modal:', err.message);
  }
}

async function run() {
  console.log('Starting E2E Puppeteer Test Suite against', BASE_URL);

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
  });

  try {
    // -------------------------------------------------------------
    // STRICT VERIFICATION: Language Modal Isolation & Preservation
    // -------------------------------------------------------------
    console.log('\n--- Running Strict Verification: Language Modal Isolation ---');

    // Verification 1: Ensure Language Modal NEVER renders on /admin/packages
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('admin_auth', 'true');
      localStorage.removeItem('languageSelected'); // Language unselected
    });

    await page.goto(`${BASE_URL}/admin/packages`, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForSelector('button', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 800));

    const hasLanguageModalOnAdmin = await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Choose Language'));
      return !!heading;
    });

    const ssVerifAdmin = path.join(SCREENSHOT_DIR, 'verification_admin_no_language_modal.png');
    await page.screenshot({ path: ssVerifAdmin, fullPage: false });

    if (!hasLanguageModalOnAdmin) {
      recordResult(
        'Verification 1: Admin Route Isolation',
        'Navigate to /admin/packages with unselected language',
        'NO Language Modal rendered on admin route',
        'Language Modal is completely absent (returns null)',
        'PASS',
        ssVerifAdmin
      );
    } else {
      recordResult(
        'Verification 1: Admin Route Isolation',
        'Navigate to /admin/packages with unselected language',
        'NO Language Modal rendered on admin route',
        'Language Modal is still visible on admin route!',
        'FAIL',
        ssVerifAdmin
      );
    }

    // Verification 2: Ensure Language Modal STILL SHOWS on / (Homepage) in fresh incognito context
    console.log('\n--- Verifying Public Language Modal on Homepage in Incognito ---');
    const incognitoContext = await browser.createBrowserContext();
    const incognitoPage = await incognitoContext.newPage();
    await incognitoPage.setViewport({ width: 1400, height: 900 });

    await incognitoPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1200));

    const hasLanguageModalOnHome = await incognitoPage.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Choose Language'));
      return !!heading;
    });

    const ssVerifHome = path.join(SCREENSHOT_DIR, 'verification_homepage_language_modal_visible.png');
    await incognitoPage.screenshot({ path: ssVerifHome, fullPage: false });
    await incognitoContext.close();

    if (hasLanguageModalOnHome) {
      recordResult(
        'Verification 2: Public Route Preservation',
        'Navigate to / (Homepage) in clean incognito window',
        'Language Modal renders and is visible for public/Russian clients',
        'Language Modal successfully appears on Homepage',
        'PASS',
        ssVerifHome
      );
    } else {
      recordResult(
        'Verification 2: Public Route Preservation',
        'Navigate to / (Homepage) in clean incognito window',
        'Language Modal renders and is visible for public/Russian clients',
        'Language Modal did not appear on Homepage!',
        'FAIL',
        ssVerifHome
      );
    }

    // -------------------------------------------------------------
    // TEST 1: The "International" Filter Fix (Public)
    // -------------------------------------------------------------
    console.log('\n--- Running Test 1: The International Filter Fix ---');
    await page.goto(`${BASE_URL}/packages`, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.waitForFunction(() => document.querySelectorAll('h3, .group').length > 5, { timeout: 10000 });

    // Dismiss language modal on test page to ensure clean screenshot
    await dismissLanguageModalIfPresent(page);
    await new Promise(r => setTimeout(r, 400));

    const getVisiblePackageTitles = async () => {
      return await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.grid .group, .grid h3, .grid a'));
        return cards.map(el => el.textContent || '').join(' | ');
      });
    };

    let titlesAll = await getVisiblePackageTitles();
    const hasWinterJeep = titlesAll.includes('Winter Jeep Tour');
    const hasWinterFairy = titlesAll.includes('Winter Fairy Tale in the Uimon');
    const hasKathmandu = titlesAll.includes('Kathmandu & Pokhara');

    const ss1_1 = path.join(SCREENSHOT_DIR, 'test1_1_all_packages.png');
    await page.screenshot({ path: ss1_1, fullPage: false });

    if (hasWinterJeep && hasWinterFairy && hasKathmandu) {
      recordResult(
        'Test 1: Public Packages',
        'Navigate to /packages (All Filter)',
        'Winter Jeep, Winter Fairy Tale, Kathmandu & Pokhara visible on /packages',
        'All 3 packages visible on initial load without modal overlay',
        'PASS',
        ss1_1
      );
    } else {
      recordResult(
        'Test 1: Public Packages',
        'Navigate to /packages (All Filter)',
        'Winter Jeep, Winter Fairy Tale, Kathmandu & Pokhara visible',
        `Missing packages. Found: Jeep=${hasWinterJeep}, Fairy=${hasWinterFairy}, Kathmandu=${hasKathmandu}`,
        'FAIL',
        ss1_1
      );
    }

    // Click "International" filter pill
    console.log('Clicking International filter pill...');
    const clickedIntl = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.trim() === 'International');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!clickedIntl) {
      throw new Error('International filter button not found!');
    }

    await new Promise(r => setTimeout(r, 800));
    await dismissLanguageModalIfPresent(page);

    const ss1_2 = path.join(SCREENSHOT_DIR, 'test1_2_international_filter.png');
    await page.screenshot({ path: ss1_2, fullPage: false });

    let titlesIntl = await getVisiblePackageTitles();
    const hasWinterJeepIntl = titlesIntl.includes('Winter Jeep Tour');
    const hasWinterFairyIntl = titlesIntl.includes('Winter Fairy Tale in the Uimon');
    const hasKathmanduIntl = titlesIntl.includes('Kathmandu & Pokhara');

    if (hasWinterJeepIntl && hasWinterFairyIntl && hasKathmanduIntl) {
      recordResult(
        'Test 1: International Filter',
        'Click "International" filter pill',
        '3 target packages remain visible under International filter',
        'All 3 packages STILL visible and rendered cleanly',
        'PASS',
        ss1_2
      );
    } else {
      recordResult(
        'Test 1: International Filter',
        'Click "International" filter pill',
        '3 target packages remain visible under International filter',
        `Missing under International filter. Jeep=${hasWinterJeepIntl}, Fairy=${hasWinterFairyIntl}, Kathmandu=${hasKathmanduIntl}`,
        'FAIL',
        ss1_2
      );
    }

    // Click "India" filter pill
    console.log('Clicking India filter pill...');
    const clickedIndia = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.trim() === 'India');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!clickedIndia) {
      throw new Error('India filter button not found!');
    }

    await new Promise(r => setTimeout(r, 800));
    await dismissLanguageModalIfPresent(page);

    const ss1_3 = path.join(SCREENSHOT_DIR, 'test1_3_india_filter.png');
    await page.screenshot({ path: ss1_3, fullPage: false });

    let titlesIndia = await getVisiblePackageTitles();
    const hasWinterJeepIndia = titlesIndia.includes('Winter Jeep Tour');
    const hasWinterFairyIndia = titlesIndia.includes('Winter Fairy Tale in the Uimon');
    const hasKathmanduIndia = titlesIndia.includes('Kathmandu & Pokhara');

    if (!hasWinterJeepIndia && !hasWinterFairyIndia && !hasKathmanduIndia) {
      recordResult(
        'Test 1: India Filter (Exclusion)',
        'Click "India" filter pill',
        '3 International packages are hidden from India filter',
        'All 3 packages successfully hidden from India view',
        'PASS',
        ss1_3
      );
    } else {
      recordResult(
        'Test 1: India Filter (Exclusion)',
        'Click "India" filter pill',
        '3 International packages are hidden from India filter',
        `Packages erroneously visible under India filter. Jeep=${hasWinterJeepIndia}, Fairy=${hasWinterFairyIndia}, Kathmandu=${hasKathmanduIndia}`,
        'FAIL',
        ss1_3
      );
    }

    // -------------------------------------------------------------
    // TEST 2: The Admin UI Category Selector
    // -------------------------------------------------------------
    console.log('\n--- Running Test 2: The Admin UI Category Selector ---');
    await page.goto(`${BASE_URL}/admin/packages`, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForSelector('button', { timeout: 10000 });

    console.log('Clicking New Package button in Admin...');
    const clickedNew = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const newBtn = btns.find(b => b.textContent.includes('New Package'));
      if (newBtn) {
        newBtn.click();
        return true;
      }
      return false;
    });

    if (!clickedNew) {
      throw new Error('New Package button not found in AdminPackages');
    }

    await page.waitForSelector('form', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 600));

    // Inspect "Category / Type" dropdown
    const selectData = await page.evaluate(() => {
      const select = document.querySelector('select#category-\\/-type') || document.querySelector('select');
      if (select) {
        const options = Array.from(select.querySelectorAll('option')).map(o => ({
          value: o.value,
          text: o.textContent.trim()
        }));
        const labelText = select.labels?.[0]?.textContent?.trim() || 'Category / Type';
        return {
          found: true,
          label: labelText,
          options,
          selectedValue: select.value
        };
      }
      return { found: false };
    });

    const ss2 = path.join(SCREENSHOT_DIR, 'test2_admin_category_selector.png');
    await page.screenshot({ path: ss2, fullPage: false });

    const hasIndiaOption = selectData.options?.some(o => o.value === 'India');
    const hasIntlOption = selectData.options?.some(o => o.value === 'International');

    if (selectData.found && hasIndiaOption && hasIntlOption) {
      recordResult(
        'Test 2: Admin UI Category Selector',
        'Open New Package modal/form in AdminPackages',
        'Category / Type dropdown visible with "India" and "International" options',
        `Dropdown cleanly rendered with options: ${JSON.stringify(selectData.options.map(o => o.text))}`,
        'PASS',
        ss2
      );
    } else {
      recordResult(
        'Test 2: Admin UI Category Selector',
        'Open New Package modal/form in AdminPackages',
        'Category / Type dropdown visible with "India" and "International" options',
        `Selector data: ${JSON.stringify(selectData)}`,
        'FAIL',
        ss2
      );
    }

    // -------------------------------------------------------------
    // TEST 3: The Full Lifecycle (Create -> Filter -> Edit -> Filter)
    // -------------------------------------------------------------
    console.log('\n--- Running Test 3: The Full Lifecycle Test ---');
    const testLifecycleId = String(Date.now());
    const testPackageName = `E2E Automated Package ${testLifecycleId}`;
    const testExpiry = new Date(Date.now() + 86400000 * 30).toISOString();

    console.log(`1. Creating test package ${testLifecycleId} with category="India"...`);
    const initialPayload = {
      id: testLifecycleId,
      name: testPackageName,
      title: testPackageName,
      slug: `e2e-auto-${testLifecycleId}`,
      category: 'India',
      type: 'India',
      startingPrice: '32000',
      expiryDate: testExpiry,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: '<p>Automated lifecycle test package</p>'
    };

    const postRes = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initialPayload)
    });

    if (!postRes.ok) throw new Error(`POST failed with HTTP ${postRes.status}`);

    // Verify on /packages under "India"
    await page.goto(`${BASE_URL}/packages`, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForSelector('h1', { timeout: 10000 });
    await dismissLanguageModalIfPresent(page);
    await new Promise(r => setTimeout(r, 600));

    // Click "India"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.trim() === 'India');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));
    await dismissLanguageModalIfPresent(page);

    const ss3_1 = path.join(SCREENSHOT_DIR, 'test3_1_lifecycle_india.png');
    await page.screenshot({ path: ss3_1, fullPage: false });

    let indiaTitles = await getVisiblePackageTitles();
    const foundUnderIndia = indiaTitles.includes(testPackageName);

    if (foundUnderIndia) {
      recordResult(
        'Test 3: Lifecycle - Phase 1 (Create India)',
        'Create package with category="India", verify under India filter',
        'Test package visible under India filter',
        `Package "${testPackageName}" rendered successfully without overlay`,
        'PASS',
        ss3_1
      );
    } else {
      recordResult(
        'Test 3: Lifecycle - Phase 1 (Create India)',
        'Create package with category="India", verify under India filter',
        'Test package visible under India filter',
        `Package not found in visible cards. Titles: ${indiaTitles.slice(0, 100)}...`,
        'FAIL',
        ss3_1
      );
    }

    // Now update test package to category="International"
    console.log(`2. Updating test package ${testLifecycleId} to category="International"...`);
    const updatePayload = {
      ...initialPayload,
      category: 'International',
      type: 'International',
      updatedAt: new Date().toISOString()
    };

    const putRes = await fetch(`${API_URL}/${testLifecycleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });

    if (!putRes.ok) throw new Error(`PUT failed with HTTP ${putRes.status}`);

    // Reload /packages and click "International"
    await page.goto(`${BASE_URL}/packages`, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForSelector('h1', { timeout: 10000 });
    await dismissLanguageModalIfPresent(page);
    await new Promise(r => setTimeout(r, 600));

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.trim() === 'International');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));
    await dismissLanguageModalIfPresent(page);

    const ss3_2 = path.join(SCREENSHOT_DIR, 'test3_2_lifecycle_international.png');
    await page.screenshot({ path: ss3_2, fullPage: false });

    let intlTitles = await getVisiblePackageTitles();
    const foundUnderIntl = intlTitles.includes(testPackageName);

    if (foundUnderIntl) {
      recordResult(
        'Test 3: Lifecycle - Phase 2 (Edit International)',
        'Update package to category="International", verify under International filter',
        'Test package moved and rendered under International filter',
        `Package "${testPackageName}" cleanly rendered under International filter`,
        'PASS',
        ss3_2
      );
    } else {
      recordResult(
        'Test 3: Lifecycle - Phase 2 (Edit International)',
        'Update package to category="International", verify under International filter',
        'Test package moved and rendered under International filter',
        `Package not found under International filter.`,
        'FAIL',
        ss3_2
      );
    }

    // Cleanup test package
    console.log(`3. Cleaning up test package ${testLifecycleId}...`);
    const delRes = await fetch(`${API_URL}/${testLifecycleId}`, { method: 'DELETE' });
    console.log(`Cleanup status: ${delRes.status}`);

    // -------------------------------------------------------------
    // TEST 4: URL Route Filtering (CategoryDetail.tsx)
    // -------------------------------------------------------------
    console.log('\n--- Running Test 4: URL Route Filtering (CategoryDetail.tsx) ---');
    await page.goto(`${BASE_URL}/category/international`, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForSelector('h1', { timeout: 10000 });
    await dismissLanguageModalIfPresent(page);
    await new Promise(r => setTimeout(r, 800));

    const ss4 = path.join(SCREENSHOT_DIR, 'test4_category_detail_international.png');
    await page.screenshot({ path: ss4, fullPage: false });

    const catDetailTitles = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.grid h3, .grid a, .grid .group'));
      return cards.map(el => el.textContent || '').join(' | ');
    });

    const catJeep = catDetailTitles.includes('Winter Jeep Tour');
    const catFairy = catDetailTitles.includes('Winter Fairy Tale in the Uimon');
    const catKathmandu = catDetailTitles.includes('Kathmandu & Pokhara');

    if (catJeep && catFairy && catKathmandu) {
      recordResult(
        'Test 4: URL Route Filtering',
        'Direct navigate to /category/international',
        'Winter Jeep, Winter Fairy Tale, Kathmandu & Pokhara rendered on CategoryDetail',
        'All 3 packages cleanly rendered on /category/international without overlay',
        'PASS',
        ss4
      );
    } else {
      recordResult(
        'Test 4: URL Route Filtering',
        'Direct navigate to /category/international',
        'Winter Jeep, Winter Fairy Tale, Kathmandu & Pokhara rendered on CategoryDetail',
        `Missing on CategoryDetail: Jeep=${catJeep}, Fairy=${catFairy}, Kathmandu=${catKathmandu}`,
        'FAIL',
        ss4
      );
    }

  } catch (err) {
    console.error('Fatal error during E2E test:', err);
    recordResult('E2E Fatal Error', 'Execution exception', 'No unhandled errors', err.message, 'FAIL');
  } finally {
    await browser.close();
  }

  console.log('\n=============================================');
  console.log('E2E TEST SUMMARY:');
  console.log('=============================================');
  console.table(results);
}

run();
