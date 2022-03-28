const url = 'https://dekhockeylarelance.ca/calendrier/';
const cheerio = require('cheerio');
const { extractHtml, parseDateToYmd, cacheInFile, cacheFileName } = require('./utils');

function parseTable($, element) {
    const td = $(element).find("td").toArray();

    const [, firstTeam, , secondTeam, , time, surface] = td;

    const data = {
      firstTeam: $(firstTeam).find('.line1').text().trim(),
      secondTeam: $(secondTeam).find('.line1').text().trim(),
      time: $(time).find('span').text().trim(),
      surface: $(surface).find('a').text().trim(),
    };

    return data;
}

function extractContent($) {
    let dataRow = { events: [] };
    let data = [];
    $("#calendar > div")
      .toArray()
      .forEach((element) => {
        const div =  $(element);
        const classes = div.attr('class').split(' ');

        if (classes.includes('table-heading')) {
          dataRow.date = div.find('h2').text().trim();
          dataRow.ymd = parseDateToYmd(dataRow.date);
        } else {
          dataRow.events = div.find('table tbody tr')
            .toArray()
            .map((tableRow) => parseTable($, tableRow));

          data.push(dataRow);
          dataRow = { events: [] };
        }

      });

    return data;
}

async function extractHtmlWithCache(url, waitFor, { useCache = false, filenameToSave = null } = {}) {
  const extract = () => extractHtml(url, waitFor);

  if (!useCache) return extract();

  const filename = filenameToSave ? filenameToSave : cacheFileName(url);

  return cacheInFile(filename, extract);
}

async function deklarelance({ useCache = false, filenameToSave = null } = {}) {
    const resHtml = await extractHtmlWithCache(url, '#calendar .table-heading h2', { useCache, filenameToSave });
    const $ = cheerio.load(resHtml);
    return extractContent($);
};

module.exports = deklarelance;
