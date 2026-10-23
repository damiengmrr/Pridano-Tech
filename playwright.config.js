const { defineConfig } = require('@playwright/test');

/* Tests navigateur : serveur Express local, Chromium, aucun envoi réel (les API sensibles sont interceptées). */
module.exports = defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60000,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:4174', browserName: 'chromium', headless: true, trace: 'retain-on-failure', launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } },
  webServer: { command: 'node -e "require(\'./server\').createApp().listen(4174,\'127.0.0.1\')"', url: 'http://127.0.0.1:4174', reuseExistingServer: false, timeout: 60000 },
});
