const puppeteer = require('puppeteer');

const devices = [
  {
    name: 'desktop',
    viewport: { width: 1920, height: 1080 }
  },
  {
    name: 'iPad',
    userAgent: puppeteer.devices['iPad Pro'].userAgent,
    viewport: puppeteer.devices['iPad Pro'].viewport
  },
  {
    name: 'iPhone',
    userAgent: puppeteer.devices['iPhone X'].userAgent,
    viewport: puppeteer.devices['iPhone X'].viewport
  }
];

async function takeScreenshots() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  });

  const page = await browser.newPage();
  
  for (const device of devices) {
    // 디바이스 에뮬레이션 설정
    if (device.userAgent) {
      await page.setUserAgent(device.userAgent);
    }
    await page.setViewport(device.viewport);
    
    await page.goto('http://localhost:3000');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await page.screenshot({
      path: `screenshot-${device.name}.png`,
      fullPage: true
    });
    
    console.log(`${device.name} 스크린샷 완료 (${device.viewport.width}x${device.viewport.height})`);
  }

  await browser.close();
}

takeScreenshots();
