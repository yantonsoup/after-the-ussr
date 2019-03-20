import * as d3Fetch from 'd3-fetch'
import setupScrollama from './setupScrollama.js';
import firstPaint from './firstPaint';
import topojson from 'topojson';
import WorldMap from './WorldMap.js'
import BarChart from './BarChart.js'
import LineChart from './LineChart.js'
import {
  populationsIn1989millions,
} from "./constants";

window.onbeforeunload = function() {
  window.scrollTo(0, 0);
};

firstPaint();

async function initializeGraphics () {
  const worldTopo = await d3Fetch.json("./json/110topoworld.json")
  
  console.warn({worldTopo})

  const countries = topojson.feature(worldTopo, worldTopo.objects.subunits)
  const features = countries.features;

  const worldMap = new WorldMap({
    data: features,
    element: '.map-graphic-container'
  })

  const barChart = new BarChart({
    element: '.bar-graphic',
    data: populationsIn1989millions
  })

  const russiaPopulationOverTime = await d3Fetch.tsv("./russia.tsv")
  console.warn({russiaPopulationOverTime})

  const lineChart = new LineChart({
    data: russiaPopulationOverTime,
    element: '.line-graphic'
  })


  console.warn('features', features);

  setupScrollama(worldMap, barChart, lineChart);
}

initializeGraphics()