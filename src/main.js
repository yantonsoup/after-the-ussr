import setupScrollama from './setupScrollama.js';
import firstPaint from './firstPaint';
import loadMap from "./loadMap";
import WorldMap from './WorldMap.js'
import BarChart from './BarChart.js'
import {
  populationsIn1989,
} from "./constants";

// even though Rollup is bundling all your files together, errors and
// logs will still point to your original source modules
console.log('if you have sourcemaps enabled in your devtools, click on main.js:5 -->');

window.onbeforeunload = function() {
  window.scrollTo(0, 0);
};


loadMap().then(json => {

  firstPaint();

  const countries = topojson.feature(json, json.objects.subunits)
  const features = countries.features;

  const worldMap = new WorldMap({
    data: features,
    element: '.scroll-graphic'
  })

  const barChart = new BarChart({
    element: '.bar-graphic',
    data: populationsIn1989
  })

  console.warn('features', features);

  setupScrollama(worldMap, barChart);
});