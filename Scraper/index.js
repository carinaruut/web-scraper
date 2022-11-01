const browserObject = require("./browser");

(async () => {
  const browser = await browserObject.startBrowser();
  const page = await navigateToPage(browser);

  const flight = await getFlightData(page);

  logFlightData(flight);

  await browser.close();
})();

async function navigateToPage(browser) {
  const page = await browser.newPage();
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36";
  await page.setUserAgent(userAgent);

  await page.goto(
    "https://www.skyscanner.net/transport/flights/tll/stoc/221225/?adults=1&cabinclass=economy&destinationentityid=27539477&originentityid=27547202",
    {
      waitUntil: "networkidle2",
    }
  );

  await acceptCookies(page);

  return page;
}

async function acceptCookies(page) {
  const acceptCookiesButton = await page.waitForSelector("#acceptCookieButton");

  await acceptCookiesButton.click();
}

async function getFlightData(page) {
  const [button] = await page.$x("//button[contains(., 'Cheapest')]");
  if (button) {
    await button.click();
  }

  const date = "25.12.2022";
  const prices = await getPrices(page);
  const locations = await getLocations(page);
  const times = await getTimes(page);
  const stops = await getStops(page);
  const durations = await getDurations(page);

  return (flight = {
    Date: date,
    Price: prices[1],
    Departure: `${locations[0]} ${times[0]}`,
    Arrival: `${locations[1]} ${times[1]}`,
    Duration: durations[0],
    Stops: stops[0].trim().split(/\s+/)[2],
  });
}

const getTimes = async (page) =>
  (times = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(".LegInfo_routePartialTime__OTFkN")
    ).map((x) => x.textContent);
  }));

const getPrices = async (page) =>
  await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(".Price_mainPriceContainer__MDM3O")
    ).map((x) => x.textContent);
  });

const getDurations = async (page) =>
  await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(".Duration_duration__NmUyM")
    ).map((x) => x.textContent);
  });

const getLocations = async (page) =>
  await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(".LegInfo_routePartialCityTooltip__NTE4Z")
    ).map((x) => x.textContent);
  });

const getStops = async (page) =>
  await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(".LegInfo_stopsLabelContainer__MmM0Z")
    ).map((x) => x.textContent);
  });

function logFlightData(flight) {
  const groupTitle = "Ideal flight";
  console.group(groupTitle);
  console.table(flight);
  console.groupEnd(groupTitle);
}
