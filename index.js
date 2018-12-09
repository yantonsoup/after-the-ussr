window.onbeforeunload = function() {
  window.scrollTo(0, 0);
};

var colors = [
  "#feedde",
  "#fdbe85",
  "#fd8d3c",
  "#e6550d",
  "#a63603",
  "#feedde",
  "#fdbe85",
  "#fd8d3c",
  "#e6550d",
  "#feedde",
  "#fdbe85",
  "#fd8d3c",
  "#e6550d",
  "#a63603"
];

// initialize the scrollama
var scroller = scrollama();

// Setup sizes for the graphic and steps 
var container = d3.select(".scroll");
var graphic = container.select(".scroll__graphic");
var text = container.select(".scroll__text");

var bodyWidth = d3.select("body").node().offsetWidth;
var textWidth = text.node().offsetWidth;

var step = text.selectAll(".step");
var stepHeight = Math.floor(window.innerHeight * 0.75);

var graphicMargin = 16 * 4; // 64px
var graphicWidth = container.node().offsetWidth - graphicMargin;
const graphicHeight = graphicWidth;
// var graphicHeight = Math.floor(window.innerHeight / 2.4);
console.warn({ graphicHeight });

var graphicMarginTop = Math.floor(window.innerHeight * 0.3);
// graphicMargin / 2;

step.style("height", window.innerHeight+"px");

graphic
  .style("width", graphicWidth + "px")
  .style("height", graphicHeight + "px")
  .style("top", graphicMarginTop + "px");
// -----------------------------------
console.warn({ graphicHeight });
console.warn({ graphicWidth });
console.warn({ stepHeight });

d3.select(".header-container").style("height", window.innerHeight + "px")
d3.select(".ussr-svg").style("height", 200 + "px")
d3.select(".ussr-svg").style("width", 200 + "px")
// Animations 

function firstAnimation() {
  var scale = 2;

  console.warn("scroll container size", graphic.node().getBoundingClientRect());

  var translateX = -Math.floor(graphicWidth * 0.75);
  var translateY = -Math.floor(graphicHeight * 0.4);

  console.warn({ scale });
  console.warn({ width });
  console.warn({ height });
  console.warn({ translateX });
  console.warn({ translateY });

  d3.select("#map")
    .transition()
    .duration(1000)
    .attr(
      "transform",
      "translate(" +
        width / 2 +
        "," +
        height / 2 +
        ")scale(" +
        scale +
        ")translate(" +
        translateX +
        "," +
        translateY +
        ")"
    );

  // d3.selectAll(".soviet-country")
  //   .transition()
  //   .duration(100)
  //   .style("fill", "#a63603")
  //   .style("stroke-width", 0.5 + "px");

  d3.selectAll(".non-soviet-country")
    .transition()
    .duration(100)
    .style("opacity", "0.5")
    .style("stroke-width", 0.25 + "px");

    d3.selectAll(".soviet-country")
    .transition()
    .duration(1000)
    .style("fill", function(d, i) {
      // console.warn('i', i)
      return colors[i];
    });
}

function secondAnimation() {
  var scale = 4;
  var translateX = -Math.floor(graphicWidth * 0.6);
  var translateY = -Math.floor(graphicHeight * 0.3);

  d3.select("#map")
    .transition()
    .duration(1000)
    .attr(
      "transform",
      "translate(" +
        width / 2 +
        "," +
        height / 2 +
        ")scale(" +
        scale +
        ")translate(" +
        translateX +
        "," +
        translateY +
        ")"
    );

  d3.selectAll(".non-soviet-country")
    .transition()
    .duration(500)
    .style("stroke-width", 0.175 + "px");

  d3.selectAll(".soviet-country")
    .transition()
    .duration(500)
    .style("stroke-width", 0.25 + "px");

  fourthAnimation()

}

function thirdAnimation() {

}

var sovietLabelShift = {
  'ARM': {x: -12, y: 2}, 
  'AZE': {x: -8, y: 5}, 
  'BLR': {x: -14, y: 4}, 
  'EST': {x: -12, y: 0}, 
  'GEO': {x: -13, y: 1}, 
  'KAZ': {x: 14, y: 6}, 
  'KGZ': {x: 5, y: 3}, 
  'LVA': {x: -12, y: 0}, 
  'LTU': {x: -14, y: 0}, 
  'MDA': {x: -12, y: 1}, 
  'RUS': {x: -40, y: 10}, 
  'TJK': {x: -4, y: 6}, 
  'TKM': {x: -10, y: 8}, 
  'UKR': {x: -9, y: 7}, 
  'UZB': {x: -12, y: 0}
}

function fourthAnimation() {
  console.log("map", map);
  console.warn("worldGeoJson", worldGeoJson);
  console.warn("path", path);

  d3.selectAll(".non-soviet-country")
    .transition()
    .duration(500)
    .style("opacity", "0")

  map.selectAll(".place-label")
    .data(topojson.feature(worldGeoJson, worldGeoJson.objects.subunits).features)
    .enter().append("text")
    .attr("class", "place-label")
    .attr("transform", function(d) { 
        // can get centroid easily like this!  path.centroid(d)
      const [x, y] = path.centroid(d)
      return `translate(${x},${y})`; 
    })
    .attr("dx", function({id}) { 
      if (sovietCountryIsoCodes.includes(id)) {
        const { x } = sovietLabelShift[id]
        console.warn(x)
        // can get centroid easily like this!  path.centroid(d)
        return `${x}px`; 
      } 
      return
    })
    .attr("dy", function(d) { 
      if (sovietCountryIsoCodes.includes(d.id)) {

      const name = d.id
      const { y } = sovietLabelShift[name]
        // can get centroid easily like this!  path.centroid(d)
      return `${y}px`; 
      }
      return
    })
    // .style("z-index", '100')
    .text(function(d) { 
      if (sovietCountryIsoCodes.includes(d.id)) {
        console.warn('soviet datapoint', d)
        return d.properties.name; 
      }

      return null;
    }).style("font-size", 3 +"px")
}

// scrollama event handlers
function handleStepEnter(response) {
  console.warn("handleStepEnter", { response });
  console.warn("handleStepEnter step index: response.index", response.index);
  if (response.index === 0) {
    console.warn("FIRST STEP!");
    firstAnimation();
  }

  if (response.index === 1) {
    console.warn("SECOND STEP!");
    secondAnimation();
  }

  if (response.index === 2) {
    console.warn("THIRD STEP!");
    thirdAnimation();
  }

  if (response.index === 3) {
    console.warn("FOURTH STEP!");
    fourthAnimation();
  }
  // response = { element, direction, index }
  // add color to current step only
  step.classed("is-active", function(d, i) {
    return i === response.index;
  });

  // update graphic based on step
  graphic.select("p").text(response.index + 1);
}

function handleContainerEnter(response) {
  d3.select(".intro__overline").classed("sticky_break", true);
  console.warn({ handleContainerEnter });
  // response = { direction }
}

function handleContainerExit(response) {
  console.warn({ handleContainerExit });
  // response = { direction }
}

function setupStickyfill() {
  d3.selectAll(".sticky").each(function() {
    Stickyfill.add(this);
  });
}

function init() {
  setupStickyfill();
  scroller
    .setup({
      container: ".scroll",
      graphic: ".scroll__graphic",
      text: ".scroll__text",
      step: ".scroll__text .step",
      debug: false,
      offset: 0.8
    })
    .onStepEnter(handleStepEnter)
    .onContainerEnter(handleContainerEnter)
    .onContainerExit(handleContainerExit);

  // setup resize event -> this is causing issues in mobile when the mobile headers resize
  // window.addEventListener("resize", handleResize);
}

// kick things off
init();
// initializeD3()
