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

  // click handlers
  d3.selectAll(".about-button").on("click", () => {
    d3.select(".about-section").style({
      display: "flex"
    });
    d3.select(".about-section")
      .transition()
      .duration(250)
      .style({
        opacity: 1
      });

    d3.selectAll(".about-section").style("top", window.scrollY + "px");

    d3.select("body").style("overflow", "hidden");
  });

  d3.selectAll(".sources-button").on("click", () => {
    d3.select(".sources-section").style({
      display: "flex"
    });
    d3.select(".sources-section")
      .transition()
      .duration(250)
      .style({
        opacity: 1
      });

      d3.selectAll(".sources-section").style("top", window.scrollY + "px");

    d3.select("body").style("overflow", "hidden");
  });

  d3.selectAll(".close-overlay-button").on("click", () => {
    d3.selectAll(".about-section,.sources-section")
      .transition()
      .duration(250)
      .style({
        opacity: 0
      });

    d3.selectAll(".about-section,.sources-section")
      .transition()
      .duration(250)
      .delay(250)
      .style({
        display: "none"
      });

    // ren enable body scroll
    d3.select("body").style("overflow", "scroll");
  });
}
