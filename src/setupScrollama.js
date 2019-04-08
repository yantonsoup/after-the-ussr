import 'intersection-observer';
import scrollama from 'scrollama';
import animations from "./animations";

export default function setupScrollama(worldMap, barChart, lineChart) {
  function handleStepEnter(response) {
    // console.warn('response', response)
    console.warn('SCROLLAMA animation[index]:: ', response.index)

    const animationIndex = response.index;
    const animationHandler = animations[animationIndex];


    const direction = response.direction;
    animationHandler(worldMap, barChart, lineChart, direction)
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
    .onContainerEnter((response) => {
      console.warn('onContainerEnter', response)

      // animations[0](worldMap, barChart, lineChart, response.direction)
    })
    .onContainerExit((response) => {
      console.warn('onContainerExit', response)
    
      worldMap.animateSectionStyles({
        duration: 500,
        section: ".non-soviet-country,.intl-country",
        styles: {
          opacity: "0.5",
          fill: "#d0d0d0",
          stroke: "none"
        }
      });
      // zero animation up
      worldMap.animateSectionStyles({
        duration: 500,
        section: ".soviet-country",
        styles: {
          opacity: "1",
          fill: "#d0d0d0",
          stroke: "#d0d0d0",
        }
      });
    })
}
