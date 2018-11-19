window.onbeforeunload = function() {
  window.scrollTo(0, 0);
};

// using d3 for convenience
var container = d3.select(".scroll");
var graphic = container.select(".scroll__graphic");
var text = container.select(".scroll__text");
var step = text.selectAll(".step");


var stepHeight = Math.floor(window.innerHeight * 0.75);
step.style("height", stepHeight + "px");

var bodyWidth = d3.select("body").node().offsetWidth;
var textWidth = text.node().offsetWidth;

var graphicMargin = 16 * 4; // 64px
var graphicWidth = container.node().offsetWidth - graphicMargin;
var graphicHeight = Math.floor(window.innerHeight / 2.4)
var graphicMarginTop = graphicMargin / 2

console.warn({graphicWidth})
console.warn({graphicHeight})

graphic
  .style("width", graphicWidth + "px")
  .style("height", graphicHeight + "px")
  .style("top", graphicMarginTop + "px");

  // initialize the scrollama
var scroller = scrollama();

function firstAnimation () {
  var x= -230; 
  var y = -130; 
  var scale = 2;

  console.warn('scroll container size', graphic.node().getBoundingClientRect())
  console.warn('width', width)
  console.warn('graphicWidth', graphicWidth)
  console.warn('graphicWidth x .6', Math.floor(graphicWidth * 0.66))
  console.warn('height', height)
  console.warn('graphicHeight', graphicHeight)

  var translateX = -(Math.floor(graphicWidth * 0.75))
  var translateY = -(Math.floor(graphicHeight * 0.4))

  console.warn('translateX', translateX)
  console.warn({translateY})

  d3.select("#map")
  .transition()
  .duration(750)
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + scale + ")translate(" + translateX + "," + translateY + ")")
  // .style("stroke-width", 0.01 + "%");

  d3.selectAll('.soviet-country').transition().duration(750).style('fill', 'pink')
  d3.selectAll('.non-soviet-country').transition().duration(750).style('opacity', '0.5')

}

function secondAnimation () {
  var colors = ["#feedde","#fdbe85","#fd8d3c","#e6550d","#a63603","#feedde","#fdbe85","#fd8d3c","#e6550d","#feedde","#fdbe85","#fd8d3c","#e6550d","#a63603"];

  d3.selectAll('.soviet-country')
  .transition()
  .style( "fill", function(d, i){
      // console.warn('i', i)
      return  colors[i]
  });   
}

function thirdAnimation () {
  var x = -190; 
  var y = -100; 
  var scale = 4;

  d3.select("#map")
  .transition()
  .duration(750)
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + scale + ")translate(" + x + "," + y + ")")
  .style("stroke-width", 0.01 + "%");

  d3.selectAll('.non-soviet-country').transition().duration(750).style('opacity', '0')

}

// scrollama event handlers
function handleStepEnter(response) {
  console.warn("handleStepEnter", { response });
  console.warn("handleStepEnter step index: response.index", response.index);
  if (response.index === 0) {
    console.warn('FIRST STEP!')
    firstAnimation()
  }

  if (response.index === 1) {
    console.warn('SECOND STEP!')
    secondAnimation()
  }

  if (response.index === 2) {
    console.warn('THIRD STEP!')
    thirdAnimation()
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
