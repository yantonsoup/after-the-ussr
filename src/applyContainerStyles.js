import d3 from "d3";

const toPixel = num => `${num}px`

// Setup sizes for the graphic and steps
export default function applyContainerStyles() {
  const fullPageHeight = Math.floor(window.innerHeight);
  const halfPageHeight = Math.floor(window.innerHeight / 2);
  const quarterPageHeight = Math.floor(window.innerHeight / 4);

  const storyContainer = d3
    .select(".story-container")
    .node()
    .getBoundingClientRect();

  const containerWidth = storyContainer.width;

  const mapStyles = {
    top: toPixel(quarterPageHeight),
    width: toPixel(containerWidth),
    height: toPixel(containerWidth),
  }

  const chartStyles = {
    top: toPixel(containerWidth),
    width: toPixel(containerWidth),
    height: toPixel(halfPageHeight),
  }

  if (window.innerWidth > 400) {
    chartStyles.top = toPixel(halfPageHeight);
    chartStyles.width = toPixel(halfPageHeight);

    mapStyles.width =  toPixel(halfPageHeight);
    mapStyles.height =  toPixel(halfPageHeight);
  }

  // don't use vh for step height
  d3.selectAll(".step").style("height", fullPageHeight + "px");

  d3.select(".map-graphic-container").style(mapStyles)
  d3.select(".bar-graphic-container").style(chartStyles)
  d3.select(".line-graphic-container").style(chartStyles)
}
