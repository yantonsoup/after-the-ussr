window.onbeforeunload = function() {
  window.scrollTo(0, 0);
};

window.onload = function() {
  // using d3 for convenience
  var container = d3.select(".scroll");
  var graphic = container.select(".scroll__graphic");
  var text = container.select(".scroll__text");
  var step = text.selectAll(".step");

  // initialize the scrollama
  var scroller = scrollama();

  // generic window resize listener event
  function handleResize() {
    // 1. update height of step elements
    var stepHeight = Math.floor(window.innerHeight * 0.75);
    step.style("height", stepHeight + "px");

    // 2. update width/height of graphic element
    var bodyWidth = d3.select("body").node().offsetWidth;

    var graphicMargin = 16 * 4;
    var textWidth = text.node().offsetWidth;
    var graphicWidth = container.node().offsetWidth - graphicMargin;
    var graphicHeight = Math.floor(window.innerHeight / 2.4);
    var graphicMarginTop = Math.floor(window.innerHeight / 30);

    graphic
      .style("width", graphicWidth + "px")
      .style("height", graphicHeight + "px")
      .style("top", graphicMarginTop + "px");

    // 3. tell scrollama to update new element dimensions
    scroller.resize();
  }



  // scrollama event handlers
  function handleStepEnter(response) {
    console.warn("handleStepEnter", { response });
    console.warn("handleStepEnter step index: response.index", response.index);

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
    handleResize();

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

    // setup resize event
    window.addEventListener("resize", handleResize);
  }

  // kick things off
  init();
  // initializeD3()
};
