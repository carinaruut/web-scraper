const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36"
  );
  await page.goto(
    "https://www.skyscanner.net/transport/flights/tll/stoc/221225/?adults=1&adultsv2=1&cabinclass=economy&children=0&childrenv2=&destinationentityid=27539477&inboundaltsenabled=false&infants=0&originentityid=27547202&outboundaltsenabled=false&preferdirects=false&ref=home&rtn=0",
    {
      waitUntil: "networkidle2",
    }
  );

  const acceptCookiesButton = await page.waitForSelector("#acceptCookieButton");

  await acceptCookiesButton.click();

  const [button] = await page.$x("//button[contains(., 'Cheapest')]");
  if (button) {
    await button.click();
  }

  const times = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(".LegInfo_routePartialTime__OTFkN")
    ).map((x) => x.textContent);
  });

  const prices = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(".Price_mainPriceContainer__MDM3O")
    ).map((x) => x.textContent);
  });

  const durations = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(".Duration_duration__NmUyM")
    ).map((x) => x.textContent);
  });

  const locations = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(".LegInfo_routePartialCityTooltip__NTE4Z")
    ).map((x) => x.textContent);
  });

  const stops = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(".LegInfo_stopsLabelContainer__MmM0Z")
    ).map((x) => x.textContent);
  });

  const date = "25.12.2022";

  const flight = {
    Date: date,
    Price: prices[1],
    "Departure from": locations[0],
    "Arrival to": locations[1],
    "Departure time": times[0],
    "Arrival time": times[1],
    Duration: durations[0],
    Stops: stops[0].trim().split(/\s+/)[2],
  };
  const groupTitle = "Ideal flight";
  console.group(groupTitle);
  console.table(flight);
  console.groupEnd(groupTitle);
  await browser.close();
})();
