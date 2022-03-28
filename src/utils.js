const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function cacheInFile(filename, cb) {
  const fileExist = await checkFileExists(filename);
  if (fileExist) {
    return fs.readFile(filename);
  }

  const result = await cb();
  await fs.writeFile(filename, result);

  return result;
}

function cacheFileName(url) {
  const urlObject = new URL(url);
  const hostName = urlObject.hostname;

  let date = new Date();
  let currDate = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;

  return path.join(__dirname, 'tmp', `${currDate}-${hostName}`);
}

async function extractHtml(url, waitFor = null) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: 'networkidle2',
  });

  if (!!waitFor) await page.waitForSelector(waitFor, { timeout: 3000 });
  const html = await page.evaluate(() => document.body.innerHTML);
  // await page.tracing.stop();
  await browser.close();

  return html;
}

function checkFileExists(file) {
  const fsPromises = ('promises' in fs) ? fs.promises : fs;
  return fsPromises.access(file, (fsPromises.constants || fsPromises).X_OK)
    .then(() => true)
    .catch(() => false);
}

function parseDateToYmd(dateStr) {
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const indexedMonths = Object.assign({}, ...(Object.entries(months).map(([k, s]) => ({[s]: (parseInt(k)+1).toString().padStart(2, 0)}))));

  const [, dStr, mStr, yStr] = dateStr.split(" ");

  return `${yStr}${indexedMonths[mStr]}${dStr.padStart(2, 0)}`;
}

module.exports = {
  extractHtml,
  checkFileExists,
  parseDateToYmd,
  cacheFileName,
  cacheInFile,
};

