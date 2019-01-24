import {
  sovietCountryIsoCodes,
  colors,
  sovietLabelShift,
  populationsIn1991
} from "./constants";

function zeroAnimation(map) {
  map.animateSectionStyles({ 
    duration: 1000, 
    section: '.non-soviet-country', 
    styles: { 
      opacity: '0.5',
      'stroke-width': '0.25px' 
    }
  })
}

function firstAnimation(map) {
  const zoomParams = {
    scale: 4,
    duration: 1000,
    translateX: (-Math.floor(map.width * 0.462)),
    translateY: -Math.floor(map.height * 0.2),
  }

  map.animateMapZoom(zoomParams)

  map.createLabels()

  map.createPopulationChoropleth()

  map.animateSectionStyles({ 
    duration: 500, 
    section: '.non-soviet-country', 
    styles: { 
      opacity: '0',
      'stroke-width': '0.175px' 
    }
  })
}

function secondAnimation(map) {
  map.shiftContainer({
    duration: 1000,
    top: Math.floor(window.innerHeight * 0.05)
  })

  const text = d3.select(".scroll").select(".scroll__text");
  const textWidth = text.node().offsetWidth;
  console.warn({textWidth})
  const mapContainer = d3.select(".scroll__graphic");
  const boundingBox = mapContainer.node().getBoundingClientRect();
  const { height, width } = boundingBox;

  const sortedPopulationData = populationsIn1991.sort(function(a, b) {
    return d3.ascending(a.population, b.population);
  });

  const barMargin = {
    top: 15,
    right: 75,
    bottom: 0,
    left: 60
  };
  
  const barWidth = textWidth - barMargin.left - barMargin.right;
  const barHeight = height- 100 - barMargin.top - barMargin.bottom;
  console.warn("last", d3.select("#bar-graphic").selectAll(".bar"));

  var svg = d3
  .select("#bar-graphic")
  .append("svg")
  .attr("width", barWidth + barMargin.left + barMargin.right)
  .attr("height", barHeight + barMargin.top + barMargin.bottom)
  .append("g")
  .attr(
    "transform",
    "translate(" + barMargin.left + "," + barMargin.top + ")"
  )
  .style('opacity', '0')
  

  // x scale
  var x = d3.scale
    .linear()
    .range([0, barWidth])
    .domain([
      0,
      d3.max(sortedPopulationData, function(d) {
        return d.population;
      })
    ]);
  
  // y scale
  var y = d3.scale
  .ordinal()
  .rangeRoundBands([barHeight, 0], 0.1)
  .domain(
    sortedPopulationData.map(function(d) {
      return d.name;
    })
  );
  
  //make y axis to show bar names
  var yAxis = d3.svg
    .axis()
    .scale(y)
    //no tick marks
    .tickSize(0)
    .orient("left");

  var gy = svg
    .append("g")
    .attr("class", "y-axis")
    .call(yAxis);

  var bars = svg
    .selectAll(".bar")
    .data(sortedPopulationData)
    .enter()
    .append("g");
  
  bars
    .append("rect")
    .attr("class", "bar")
    .attr("y", function(d) {
      return y(d.name);
    })
    .attr("height", y.rangeBand())
    .attr("x", 0)
    .attr("width", 0)
        
  svg
    .transition()
    .duration(2000)
    .style('opacity', '1')
  
  d3.select('.bar-graphic-header').transition()
    .duration(2000)
    .style('opacity', '1')

}

function thirdAnimation(map) {
  const sortedPopulationData = populationsIn1991.sort(function(a, b) {
    return d3.ascending(a.population, b.population);
  });

  const barMargin = {
    top: 10,
    right: 50,
    bottom: 0,
    left: 60
  };
  const mapContainer = d3.select(".scroll__graphic");
  const boundingBox = mapContainer.node().getBoundingClientRect();
  const { height, width } = boundingBox;
  
  const text = d3.select(".scroll").select(".scroll__text");
  const textWidth = text.node().offsetWidth;
  const barWidth = textWidth - barMargin.left - barMargin.right;
  const barHeight = height- 100 - barMargin.top - barMargin.bottom;

  var x = d3.scale
  .linear()
  .range([0, barWidth])
  .domain([
    0,
    d3.max(sortedPopulationData, function(d) {
      return d.population;
    })
  ]);

  var y = d3.scale
  .ordinal()
  .rangeRoundBands([barHeight, 0], 0.1)
  .domain(
    sortedPopulationData.map(function(d) {
      return d.name;
    })
  );

  d3.selectAll('rect')
    .transition()
    .delay(function (d, i) { return i*100; })
    .attr("fill", function(d, i) {
      return colors[i];
    })
    .attr("width", function(d) {
      return x(d.population);
    });

  // bars
  // .append("rect")
  // .attr("class", "bar")
  // .attr("y", function(d) {
  //   return y(d.name);
  // })
  // .attr("height", y.rangeBand())
  // .attr("x", 0)
  // .attr("width", 0)
  
    /// Add labels
    const barGraphicSvg = d3.select("#bar-graphic").select('svg')
    console.warn({barGraphicSvg})
  barGraphicSvg
    .select('g')
    .selectAll(".text")  		
	  .data(sortedPopulationData)
	  .enter()
	  .append("text")
	  .attr("class","label")
	  .attr("y", function(d) { 
      return y(d.name) 
    } )
	  .attr("x", function(d) { 
      return x(d.population) + 1; 
    })
	  .attr("dx", ".75em")
    .text(function(d) { return d.population; })
    .attr(
      "transform",
      "translate(" + 0 + "," + barMargin.top + ")"
    )
}

function fourthAnimation (map) {

  const mapSvg = d3.select(".scroll-graphic").select('svg')
  const filteredCountries = map.data.filter(country => sovietCountryIsoCodes.includes(country.id))

    
  mapSvg.selectAll("circle")
  .data(filteredCountries)
  .enter()
  .append("circle")
  .attr("cx", function (d) {
    const [x, y] = map.path.centroid(d);
    return x })
  .attr("cy", function (d) { 
    const [x, y] = map.path.centroid(d);
    return x 
  })
  .attr("r", "8px")
  .attr("fill", "red")
}

export default {
  0: zeroAnimation,
  1: firstAnimation,
  2: secondAnimation,
  3: thirdAnimation,
  4: fourthAnimation,
  5: () => {},
  6: () => {}
};
