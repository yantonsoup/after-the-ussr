export default function firstPaint () {
  // Setup sizes for the graphic and steps

  const textWidth =  d3.select(".scroll-text").node().offsetWidth;

  const stepHeight = Math.floor(window.innerHeight);

  const halfPageHeight = Math.floor(window.innerHeight/2)

  const graphicMarginTop = Math.floor(window.innerHeight * 0.25);

  d3.selectAll(".step")
    .style("height", stepHeight + "px");
  
// scroll graphic is world map container
  d3.select(".map-graphic-container")
    .style("width", '100%')
    .style("height", halfPageHeight + "px")
    .style("top", graphicMarginTop + "px");

  d3.select(".bar-graphic-container")
    .style('top', halfPageHeight + 'px')
    .style("width", '100%')
    .style("height", halfPageHeight + "px")

  // Use this to set the distance ofo the first step
  d3.select(".splash-container")
    .style("height", Math.floor(window.innerHeight * 1) + "px");

  d3.select(".splash-text-block").style("width", textWidth + "px");
  d3.select(".name-block").style("width", textWidth + "px");
} 