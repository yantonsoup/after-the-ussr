import {
  sovietCountryIsoCodes,
  colors,
  sovietLabelShift,
  populationsIn1991
} from "./constants";

function zeroAnimation() {
  d3.selectAll(".non-soviet-country")
    .transition()
    .duration(1000)
    .style("opacity", "0.5")
    .style("stroke-width", 0.25 + "px");
}

function firstAnimation({ projection, countries, path, map }) {
  console.warn("-----------------firstAnimation");

  var scale = 2;
  const mapContainer = d3.select(".scroll__graphic");
  const boundingBox = mapContainer.node().getBoundingClientRect();
  const { height, width } = boundingBox;

  var scale = 4;
  var translateX = -Math.floor(width * 0.585);
  var translateY = -Math.floor(height * 0.33);

  d3.select("#map")
    .transition()
    .duration(1000)
    .attr(
      "transform",
      `translate(${width / 2},${height /
        2})scale(${scale})translate(${translateX},${translateY})`
    );

  d3.select("#map")
    .selectAll(".place-label")
    .data(countries)
    .enter()
    .append("text")
    .attr("class", "place-label")
    .attr("transform", function(d) {
      // can get centroid easily like this!  path.centroid(d)
      const [x, y] = path.centroid(d);
      // console.warn('centroid', 'x', x, 'y', y)
      return `translate(${x},${y})`;
    })
    .attr("dx", function({ id }) {
      if (sovietCountryIsoCodes.includes(id)) {
        const { x } = sovietLabelShift[id];
        return `${x}px`;
      }
    })
    .attr("dy", function(d) {
      if (sovietCountryIsoCodes.includes(d.id)) {
        const name = d.id;
        const { y } = sovietLabelShift[name];
        return `${y}px`;
      }
    })
    // .style("z-index", '100')
    .text(function(d) {
      if (sovietCountryIsoCodes.includes(d.id)) {
        // console.warn("soviet datapoint", d);
        return d.properties.name;
      }
    })
    .style("font-size", 3 + "px");

  d3.selectAll(".non-soviet-country")
    .transition()
    .duration(500)
    .style("stroke-width", 0.175 + "px");

  d3.selectAll(".soviet-country")
    .transition()
    .duration(1000)
    .style("fill", function(d, i) {
      // console.warn('i', i)
      return colors[i];
    })
    .style("stroke-width", 0.25 + "px");

  d3.selectAll(".non-soviet-country")
    .transition()
    .duration(500)
    .style("opacity", "0");

  console.warn("APPENDING A DT", d3.select("#countryRUS"));
  d3.select("#countryRUS")
    .append("circle")
    .attr("cx", function(d) {
      const [x, y] = path.centroid(d);
      return x;
    })
    .attr("cy", function(d) {
      const [x, y] = path.centroid(d);
      return y;
    })
    .attr("r", "8px")
    .attr("fill", "black");
}

function secondAnimation({ projection, countries, path, map }) {
  console.warn("-----------------secondAnimation");
  // const nextprojection = d3.geo.albers().scale(145).parallels([20, 50])
  // var container = d3.select(".scroll");
  d3.selectAll(".non-soviet-country")
    .transition()
    .duration(500)
    .style("opacity", "0");

  // var graphicMargin = 16 * 4; // 64px
  var graphicMarginTop = Math.floor(window.innerHeight * 0.05);
  // console.warn('graphic Width AND, height', graphic.node().offsetWidth)
  d3.select(".scroll__graphic")
    .transition()
    .duration(1000)
    .style("top", graphicMarginTop + "px");

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

function thirdAnimation({ countries, path, map }) {
  console.warn("-----------------thirdAnimation");

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
  d3.select("#bar-graphic")
    .select('svg')
    .select('g')
    .selectAll(".text")  		
	  .data(sortedPopulationData)
	  .enter()
	  .append("text")
	  .attr("class","label")
	  .attr("y", function(d) { 
      console.warn('APPENDING BAR TEXT LABEL')
      console.warn('d', d)
      console.warn('y(d.name) ', y(d.name) )
      return y(d.name) 
    } )
	  .attr("x", function(d) { 
      console.warn('x(d.population) + 1', x(d.population) + 1 )
      return x(d.population) + 1; 
    })
	  .attr("dx", ".75em")
    .text(function(d) { return d.population; })
    .attr(
      "transform",
      "translate(" + 0 + "," + barMargin.top + ")"
    )
}

export default {
  0: zeroAnimation,
  1: firstAnimation,
  2: secondAnimation,
  3: thirdAnimation,
  4: () => {},
  5: () => {},
  6: () => {}
};
