import "intersection-observer";
import scrollama from "scrollama";

import animations from "./animations";

export default function setupScrollama({countries, path, map, projection}) {
  const scroller = scrollama();

  // response = { element, direction, index }
  function handleStepEnter(response) {
    console.warn("handleStepEnter, response", { response });

    switch (response.index) {
      case 0:
        animations.zeroAnimation({countries, path, map});
      break;
      case 1:
        animations.firstAnimation({projection, countries, path, map});
        break;
      case 2:
        animations.secondAnimation({projection, countries, path, map});
        break;
      case 3:
        animations.thirdAnimation({countries, path, map});
        break;

      default:
        break;
    }
  }

  function handleContainerEnter(response) {
    console.warn("Scrollama :: handleContainerEnter");
  }

  function handleContainerExit(response) {
    console.warn("Scrollama :: handleContainerExit");
  }

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
}

// setup resize event -> this is causing issues in mobile when the mobile headers resize
// window.addEventListener("resize", handleResize);
