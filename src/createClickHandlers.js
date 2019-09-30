import d3 from "d3";
// click handlers
export default function createClickHandlers() {
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
