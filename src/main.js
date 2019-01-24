import setupScrollama from './setupScrollama.js';
import firstPaint from './firstPaint';
import loadMap from "./loadMap";
import Map from './map.js'
import BarChart from './BarChart.js'

// even though Rollup is bundling all your files together, errors and
// logs will still point to your original source modules
console.log('if you have sourcemaps enabled in your devtools, click on main.js:5 -->');

window.onbeforeunload = function() {
  window.scrollTo(0, 0);
};


loadMap().then(json => {

  firstPaint();

  const countries = topojson.feature(json, json.objects.subunits)
  .features;

  const worldMap = new Map({
    data: countries,
    element: '.scroll__graphic'
  })

  const barChart = new BarChart({
    element: '#bar-graphic',
    data: countries
  })

  console.warn('countries', countries);

  setupScrollama(worldMap, barChart);
});