import 'intersection-observer';
import scrollama from 'scrollama';
import animations from "./animations";

export default function setupScrollama(worldMap, barChart) {
  function handleStepEnter(response) {
    // response = { element, direction, index }

    console.warn('SCROLLAMA animation[index]:: ', response.index)

    const animationIndex = response.index;
    const animationHandler = animations[animationIndex];

    animationHandler(worldMap, barChart)
  }

  scrollama()
    .setup({
      container: ".scroll",
      graphic: ".map-graphic-container",
      text: ".scroll-text",
      step: ".scroll-text .step",
      debug: false,
      offset: 0.9
    })
    .onStepEnter(handleStepEnter)
}
