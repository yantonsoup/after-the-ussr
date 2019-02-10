import 'intersection-observer';
import scrollama from 'scrollama';

import animations from "./animations";

export default function setupScrollama(worldMap, barChart) {

  // response = { element, direction, index }
  function handleStepEnter(response) {
    console.warn('SCROLLAMA animation[index]:: ', response.index)

    const animationIndex = response.index
    const animationHandler = animations[animationIndex]
    animationHandler(worldMap, barChart)
  }

  function handleContainerEnter(response) {
    console.warn("%c Scrollama :: handleContainerEnter", 'color: green; background-color: white' );
  }

  function handleContainerExit(response) {
    console.warn("Scrollama :: handleContainerExit");
  }

  scrollama()
    .setup({
      container: ".scroll",
      graphic: ".scroll-graphic",
      text: ".scroll-text",
      step: ".scroll-text .step",
      debug: false,
      offset: 0.9
    })
    .onStepEnter(handleStepEnter)
    .onContainerEnter(handleContainerEnter)
    .onContainerExit(handleContainerExit);
}

// setup resize event -> this is causing issues in mobile when the mobile headers resize
// window.addEventListener("resize", handleResize);
