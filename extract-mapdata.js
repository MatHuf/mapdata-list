const fs = require("fs");
const codegrid = require("codegrid-js");
const grid = codegrid.CodeGrid();
const countries = require("./countries.js");

// https://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files
// This will put simplemaps_worldmap_mapdata in the global scope
eval(fs.readFileSync("./Example/mapdata.js").toString());

const locationsWithCountries = [];

for (let key in simplemaps_worldmap_mapdata.locations) {
  let location = simplemaps_worldmap_mapdata.locations[key];
  const setCode = (error, code) => {
    if (error) {
      console.log(error);
      return;
    }
    let country = countries.countryListAlpha2[code.toUpperCase()];
    locationsWithCountries.push({ ...location, country: country });
    console.log(locationsWithCountries);
  };
  grid.getCode(Number.parseFloat(location.lat), Number.parseFloat(location.lng), setCode);
}

console.log(countries);


// group by country
// sort?
// create href
// write html doc
// html structure
// list of counties that link to list of events for that country
// list of events by country