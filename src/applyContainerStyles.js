import d3 from "d3";
import isDesktop from "./utils/isDesktop";

const toPixel = num => `${num}px`;

// Setup sizes for the graphic and steps
export default function applyContainerStyles() {
  const fullPageHeight = Math.floor(window.innerHeight);
  const fullPageWidth = Math.floor(window.innerWidth);
  const halfPageHeight = Math.floor(window.innerHeight / 2);
  const halfPageWidth = Math.floor(window.innerWidth / 2);
  const quarterPageHeight = Math.floor(window.innerHeight / 4);

  const storyContainer = d3
    .select(".story-container")
    .node()
    .getBoundingClientRect();
  console.warn({ storyContainer });

  const containerWidth = storyContainer.width;

  const mapStyles = {
    top: toPixel(quarterPageHeight),
    width: toPixel(containerWidth),
    height: toPixel(containerWidth)
  };

  const chartStyles = {
    top: toPixel(containerWidth),
    width: toPixel(containerWidth),
    height: toPixel(halfPageHeight)
  };

  if (isDesktop()) {
    const topForCentered = Math.floor((fullPageHeight - halfPageWidth) / 2);
    const leftForCentered = Math.floor((fullPageWidth - halfPageWidth) / 2);

    chartStyles.top = toPixel(topForCentered);
    chartStyles.width = toPixel(halfPageWidth);
    chartStyles.height = toPixel(halfPageWidth);
    chartStyles["margin-left"] = "auto";

    mapStyles.top = toPixel(topForCentered);
    mapStyles.left = toPixel(leftForCentered);
    mapStyles.width = toPixel(halfPageWidth);
    mapStyles.height = toPixel(halfPageWidth);
    mapStyles["border"] = "3px solid lightgoldenrodyellow";
  }

  // don't use vh for step height
  d3.selectAll(".step").style("height", fullPageHeight + "px");

  d3.select(".map-graphic-container").style(mapStyles);
  d3.select(".bar-graphic-container").style(chartStyles);
  d3.select(".line-graphic-container").style(chartStyles);
}
