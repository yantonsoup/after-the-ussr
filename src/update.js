import loadMap from "./loadMap";
import animations from './animations';

export default function update() {
  window.onbeforeunload = function() {
    window.scrollTo(0, 0);
  };

  // initialize the scrollama
  var scroller = scrollama();

  // Setup sizes for the graphic and steps
  var container = d3.select(".scroll");
  var graphic = container.select(".scroll__graphic");
  var text = container.select(".scroll__text");

  var bodyWidth = d3.select("body").node().offsetWidth;
  var textWidth = text.node().offsetWidth;

  const graphicContainer = d3.select(".scroll");
  const boundingBox = graphicContainer.node().getBoundingClientRect();
  const { width, height } = boundingBox;

  var step = text.selectAll(".step");
  var stepHeight = Math.floor(window.innerHeight * 0.75);

  var graphicMargin = 16 * 4; // 64px
  var graphicWidth = container.node().offsetWidth - graphicMargin;
  const graphicHeight = graphicWidth;
  // var graphicHeight = Math.floor(window.innerHeight / 2.4);
  console.warn('graphicHeight',{ graphicHeight });
  console.warn('height',{ height });
  console.warn('width',{ width });

  var graphicMarginTop = Math.floor(window.innerHeight * 0.25);
  // graphicMargin / 2;

  step.style("height", window.innerHeight + "px");

  graphic
    .style("width", width + "px")
    .style("height", width + "px")
    .style("top", graphicMarginTop + "px");
  // -----------------------------------
  console.warn({ graphicHeight });
  console.warn({ graphicWidth });
  console.warn({ stepHeight });
  console.warn("container.node().offsetHeight", container.node().offsetHeight);
  d3.select(".header-container").style("height", 850 + "px");

  d3.select(".ussr-svg-container").style("width", graphicWidth + "px");
  d3.select(".intro-block").style("width", graphicWidth + "px");
  d3.select(".name-block").style("width", graphicWidth + "px");

  d3.select(".ussr-svg").style("height", 200 + "px");
  d3.select(".ussr-svg").style("width", 200 + "px");
 
  // Animations
  // response = { element, direction, index }
  function handleStepEnter(response) {
    console.warn("handleStepEnter, response", { response });

    if (response.index === 0) {
      console.warn("FIRST STEP!");
      animations.firstAnimation();
    }

    if (response.index === 1) {
      animations.secondAnimation(countries);
    }

    // add color to current step only
    step.classed("is-active", function(d, i) {
      return i === response.index;
    });

  }

  function handleContainerEnter(response) {
    d3.select(".intro__overline").classed("sticky_break", true);
    console.warn({ handleContainerEnter });
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
    scroller
      .setup({
        container: ".scroll",
        graphic: ".scroll__graphic",
        text: ".scroll__text",
        step: ".scroll__text .step",
        debug: false,
        offset: 0.9
      })
      .onStepEnter(handleStepEnter)
      .onContainerEnter(handleContainerEnter)
      .onContainerExit(handleContainerExit);

    // setup resize event -> this is causing issues in mobile when the mobile headers resize
    // window.addEventListener("resize", handleResize);
  }
  // kick things off
  init();

	let countries
	
	loadMap().then(countrySubunits => {
		console.warn({ countrySubunits });
		countries = countrySubunits
		return countries
	});

}
