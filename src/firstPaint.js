export default function firstPaint () {


  // Setup sizes for the graphic and steps
  var container = d3.select(".scroll");

  const boundingBox = container.node().getBoundingClientRect();
  const { width, height } = boundingBox;

  var text = container.select(".scroll__text");
  var textWidth = text.node().offsetWidth;

  var step = text.selectAll(".step");
  var stepHeight = Math.floor(window.innerHeight * 1);
  step.style("height", stepHeight + "px");

  // var graphicMargin = 16 * 4; // 64px
  var graphicMarginTop = Math.floor(window.innerHeight * 0.25);
  var graphic = container.select(".scroll__graphic");
  console.warn('graphic width, height', graphic.node().offsetWidth)
  graphic
    .style("width", width + "px")
    .style("height", width + "px")
    .style("top", graphicMarginTop + "px");
  // -----------------------------------
  console.warn({ textWidth });
  console.warn('height',{ height });
  console.warn('width',{ width });

  d3.select(".header-container").style("height", 850 + "px");
  d3.select(".ussr-svg-container").style("width", textWidth + "px");
  d3.select(".intro-block").style("width", textWidth + "px");
  d3.select(".name-block").style("width", textWidth + "px");
  d3.select(".ussr-svg").style("height", 200 + "px");
  d3.select(".ussr-svg").style("width", 200 + "px");
 
  
} 