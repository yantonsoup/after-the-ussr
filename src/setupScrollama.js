import loadMap from "./loadMap";
import animations from './animations';

function setupStickyfill() {
  d3.selectAll(".sticky").each(function() {
    Stickyfill.add(this);
  });
}

export default function setupScrollama() {

  const scroller = scrollama();
  // response = { element, direction, index }
  function handleStepEnter(response) {
    console.warn("handleStepEnter, response", { response });

    switch(response.index) {
      case 0:
        animations.firstAnimation();
        break;
      case 1:
        animations.secondAnimation(countries);
        break;
      default:
        break;
    }

    if (response.index === 1) {
      animations.secondAnimation(countries);
    }
    // add color to current step only
    // step.classed("is-active", function(d, i) {
    //   return i === response.index;
    // });

  }

    function handleContainerEnter(response) {
      d3.select(".intro__overline").classed("sticky_break", true);
      console.warn({ handleContainerEnter });
    }

    function handleContainerExit(response) {
      console.warn({ handleContainerExit });
      // response = { direction }
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
