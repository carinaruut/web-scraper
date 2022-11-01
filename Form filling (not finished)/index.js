const puppeteer = require("puppeteer");
const fs = require("fs").promises;

const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36";

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  await page.setUserAgent(userAgent);
  await page.goto("https://www.skyscanner.net", {
    waitUntil: "networkidle2",
  });

  const cookieDivExists = await page
    .$eval("#acceptCookieButton", () => true)
    .catch(() => false);
  if (cookieDivExists) {
    await page.click("#acceptCookieButton");
  }

  await saveCookie(page);

  const exists = await page
    .$eval("#fsc-trip-type-selector-one-way", () => true)
    .catch(() => false);

  if (exists) {
    await page.click("#fsc-trip-type-selector-one-way");
  }

  await page.evaluate(
    () => (document.querySelector("#fsc-origin-search").value = "Tallinn")
  );

  await page.keyboard.press("Enter");

  await page.evaluate(
    () =>
      (document.querySelector("#fsc-destination-search").value = "Stockholm")
  );

  await page.keyboard.press("Enter");

  await page.click("#depart-fsc-datepicker-button");

  await page.select('select[name="months"]', "2022-12");

  await page.click('[aria-label="Sunday, 25 December 2022"]');

  await loadCookie(page);

  await page.click('[type="submit"]');

  await page.waitForNavigation();

  await browser.close();
})();

const saveCookie = async (page) => {
  const cookies = await page.cookies();
  const cookieJson = JSON.stringify(cookies);
  await fs.writeFile("cookies.json", cookieJson);
};

const loadCookie = async (page) => {
  const cookieJson = await fs.readFile("cookies.json");
  const cookies = JSON.parse(cookieJson);
  return await page.setCookie(...cookies);
};
