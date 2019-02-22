import d3 from 'd3';;l

export default function firstPaint () {
  // Setup sizes for the graphic and steps
  const fullPageHeight = Math.floor(window.innerHeight);

  const halfPageHeight = Math.floor(window.innerHeight/2)

  const quarterPageHeight = Math.floor(window.innerHeight * 0.25);

  d3.selectAll(".step")
    .style("height", fullPageHeight + "px");
  
// scroll graphic is world map container
  d3.select(".map-graphic-container")
    .style("width", '100%')
    .style("height", halfPageHeight + "px")
    .style("top", quarterPageHeight + "px");

  d3.select(".bar-graphic-container")
    .style('top', halfPageHeight + 'px')
    .style("width", '100%')
    .style("height", halfPageHeight + "px")

  // Use this to set the distance of the first step
  d3.select(".splash-container")
    .style("height", fullPageHeight + "px");

} 