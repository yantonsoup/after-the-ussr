import d3 from "d3";

// Setup sizes for the graphic and steps
export default function firstPaint() {
  const fullPageHeight = Math.floor(window.innerHeight);
  const halfPageHeight = Math.floor(window.innerHeight / 2);

  const storyContDims = d3
    .select(".story-container")
    .node()
    .getBoundingClientRect();

  const width = storyContDims.width;

  const quarterPageHeight = Math.floor(window.innerHeight * 0.25);

  d3.select(".splash-container").style("height", fullPageHeight + "px");

  d3.selectAll(".step").style("height", fullPageHeight + "px");

  d3.select(".map-graphic-container")
    .style("width", width + "px")
    .style("height", width + "px")
    .style("top", quarterPageHeight + "px");

  d3.select(".bar-graphic-container")
    .style("top", width + "px")
    .style("width", width + "px")
    .style("height", halfPageHeight + "px");

  d3.select(".line-graphic-container")
    .style("top", width + "px")
    .style("width", width + "px")
    .style("height", halfPageHeight + "px");

  if (window.innerWidth > 400) {
    d3.select(".map-graphic-container")
      .style("top", quarterPageHeight + "px")
      .style("width", halfPageHeight + "px")
      .style("height", halfPageHeight + "px");

    d3.select(".bar-graphic-container")
      .style("top", halfPageHeight + "px")
      .style("width", halfPageHeight + "px")
      .style("height", halfPageHeight + "px");

    d3.select(".line-graphic-container")
      .style("top", halfPageHeight + "px")
      .style("width", halfPageHeight + "px")
      .style("height", halfPageHeight + "px");

    d3.select(".story-container").style("max-width", halfPageHeight + "px");
    d3.selectAll(".overlay-section").style("max-width", halfPageHeight + "px");
    d3.selectAll(".step").style("max-width", halfPageHeight + "px");
  }

  if (window.innerWidth >= 1024) {
    d3.selectAll(".scroll-text,.intro-container ")
      .style({
        "margin-left": halfPageHeight + "px",
        "color": "lightgoldenrodyellow",
      })
  }


}
