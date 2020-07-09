const fs = require('fs');
const codegrid = require('codegrid-js');
const grid = codegrid.CodeGrid();
const countries = require('./countries.js');

const filePath = process.argv[2];
const file = fs.readFileSync(filePath);
if (!file) {
  console.log(`No file found at ${filePath}. Please be sure to add a mapdata.js file to that directory`);
}

console.log('Starting location extraction...');

// This will put simplemaps_worldmap_mapdata in the global scope
eval(file.toString());

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
      fs.writeFile('./output/locationsByCountry.html', html, (error) => {
        if (error) throw error;
        console.log('Success! HTML file created in Output directory');
      });
    }
  };
  grid.getCode(Number.parseFloat(location.lat), Number.parseFloat(location.lng), setCode);
}

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
  return `<h1>Countries</h1><nav><ul>${links}</ul></nav>`;
};

const createCountryLink = (country) => {
  return `<li><a href='#${country}'>${country}</a></li>`;
};