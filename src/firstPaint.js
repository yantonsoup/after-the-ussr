export default function firstPaint () {
  // Setup sizes for the graphic and steps
  var container = d3.select(".scroll");

  const boundingBox = container.node().getBoundingClientRect();
  const { width, height } = boundingBox;

  const text = container.select(".scroll__text");
  const textWidth = text.node().offsetWidth;

  const step = text.selectAll(".step");
  const stepHeight = Math.floor(window.innerHeight * 1);
  step.style("height", stepHeight + "px");
  text.selectAll(".step-two").style('height', '200px');

  
  // make margin top for bar chart the size of the map container
  d3.select(".data__graphic").style('top', width + 'px')
    .style("width", width + "px")
    .style("height", width + "px")

  // console.warn('graphic Width AND, height', graphic.node().offsetWidth)
  const graphicMarginTop = Math.floor(window.innerHeight * 0.25);
  d3.select(".scroll__graphic")
    .style("width", width + "px")
    .style("height", width + "px")
    .style("top", graphicMarginTop + "px");

  // Use this to set the distance ofo the first step
  d3.select(".header-container").style("height", 900 + "px");
  d3.select(".ussr-svg-container").style("width", textWidth + "px");
  d3.select(".intro-block").style("width", textWidth + "px");
  d3.select(".name-block").style("width", textWidth + "px");
  d3.select(".ussr-svg").style("height", 200 + "px");
  d3.select(".ussr-svg").style("width", 200 + "px");
} 