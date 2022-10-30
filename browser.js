const puppeteer = require("puppeteer");

async function startBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSErrors: true,
  });
  return browser;
}

module.exports = {
  startBrowser,
};
