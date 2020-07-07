const fs = require("fs");
const codegrid = require("codegrid-js");
const grid = codegrid.CodeGrid();
const countries = require("./countries.js");

// https://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files
// This will put simplemaps_worldmap_mapdata in the global scope
eval(fs.readFileSync("./Example/mapdata.js").toString());

const locationsWithCountries = [];
const uniqueCountries = [];
let locationsRemaining = Object.keys(simplemaps_worldmap_mapdata.locations).length;

for (let key in simplemaps_worldmap_mapdata.locations) {
  let location = simplemaps_worldmap_mapdata.locations[key];
  const setCode = (error, code) => {
    if (error) {
      console.log(error);
      return;
    }
    let country = countries.countryListAlpha2[code.toUpperCase()];
    if (!uniqueCountries.includes(country)) {
      uniqueCountries.push(country);
    }
    locationsWithCountries.push({ ...location, country: country });
    locationsRemaining--;
    if (!locationsRemaining) {
      uniqueCountries.sort((a, b) => a.localeCompare(b));
      const html = createHtml();
      fs.writeFile('./Output/locationsByCountry.html', html, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
      });
    }
  };
  grid.getCode(Number.parseFloat(location.lat), Number.parseFloat(location.lng), setCode);
}

// https://stackoverflow.com/questions/21617468/node-js-generate-html
const createHtml = () => {
  const header = '';
  return `<!DOCTYPE html><html><head>${header}</head><body>${createCountryLinks()}${createBody()}</body></html>`;
};

const createBody = () => {
  let countryItems = '';
  for (let country of uniqueCountries) {
    const locationsInCountry = locationsWithCountries.filter(l => l.country === country);
    countryItems = countryItems + createCountryItem(locationsInCountry, country);
  }
  return countryItems;
};

const createCountryItem = (locations, country) => {
  let list = '';
  for (let location of locations) {
    list = list + createLocationItem(location);
  }
  return `<div><h2><a name='${country}'>${country}</a></h2><ul>${list}</ul></div>`;
};

const createLocationItem = (location) => {
  return `<li><div><a href='${location.url}' target='_blank'>${location.name}</a><p>${location.description}</p></div></li>`;
};

const createCountryLinks = () => {
  let links = '';
  for (let country of uniqueCountries) {
    links = links + createCountryLink(country);
  }
  return `<nav><ul>${links}</ul></nav>`;
};

const createCountryLink = (country) => {
  return `<li><a href='#${country}'>${country}</a></li>`;
};