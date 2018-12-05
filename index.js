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

var graphicHeight = Math.floor(window.innerHeight / 2.4);
var graphicMarginTop = graphicMargin / 2;



step.style("height", stepHeight + "px");

graphic
  .style("width", graphicWidth + "px")
  .style("height", graphicHeight + "px")
  .style("top", graphicMarginTop + "px");


console.warn({ graphicHeight });
console.warn({ graphicWidth });
console.warn({ stepHeight });


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

  console.warn("FIRST translate(" + width / 2 + "," + height / 2 + ")");
  console.warn("SECOND translate(" + translateX + "," + translateY + ")");

  d3.select("#map")
    .transition()
    .duration(100)
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

  d3.selectAll(".soviet-country")
    .transition()
    .duration(100)
    .style("fill", "#a63603")
    .style("stroke-width", 0.5 + "px");

  d3.selectAll(".non-soviet-country")
    .transition()
    .duration(100)
    .style("opacity", "0.5")
    .style("stroke-width", 0.25 + "px");
}

function secondAnimation() {
  d3.selectAll(".soviet-country")
    .transition()
    .duration(500)
    .style("fill", function(d, i) {
      // console.warn('i', i)
      return colors[i];
    });
}

function thirdAnimation() {
  var scale = 4;

  var translateX = -Math.floor(graphicWidth * 0.6);
  var translateY = -Math.floor(graphicHeight * 0.3);

  d3.select("#map")
    .transition()
    .duration(500)
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
}

function fourthAnimation() {
  console.log("map", map);
  console.warn("worldGeoJson", worldGeoJson);
  console.warn("path", path);
  console.warn({ svg });

  console.warn('path.bounds()', mercatorBounds(projection, maxlat))

  d3.select('svg')
  .selectAll("text")
  .data(worldGeoJson.features)
  .enter()
  .append("text")
  .each(function(d) {
    if (sovietCountryIsoCodes.includes(d.properties.ISO_A3)) {
      console.warn('datapoint of soviet', d)
      d3.select(this)
      .attr("x", function(d) {
        return path.centroid(d)[0];
      })
      .attr("y", function(d) {
        return path.centroid(d)[1];
      })
        .text(function(d) {
          return d.properties.ADMIN;
        });
    }
  })
  .attr("class", "label");
  // ver ok = d3.select(".scroll__graphic")
  // d3.select(".scroll__graphic")
  // .data(worldGeoJson.features)
  // .enter()
  // .append("text")
  //   .attr("class", "label")
  //   .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
  //   .text(function(d) {
  //     console.warn('d',d )
  //     return d.properties.ADMIN;
  //   } )


  // d3.selectAll('.soviet-country')
  //   .transition()
  //   .duration(500)
  //   .style("stroke-width", 0.25 + "px");
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

  // 1. force a resize on load to ensure proper dimensions are sent to scrollama
  // handleResize();

  // 2. setup the scroller passing options
  // this will also initialize trigger observations
  // 3. bind scrollama event handlers (this can be chained like below)
  scroller
    .setup({
      container: ".scroll",
      graphic: ".scroll__graphic",
      text: ".scroll__text",
      step: ".scroll__text .step",
      debug: true,
      offset: 0.5
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
