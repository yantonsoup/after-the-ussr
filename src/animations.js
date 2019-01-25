function zeroAnimation(map) {
  map.animateSectionStyles({ 
    duration: 1000, 
    section: '.non-soviet-country', 
    styles: { 
      opacity: '0.5',
      'stroke-width': '0.25px' 
    }
  })
}

function firstAnimation(map) {
  const zoomParams = {
    scale: 4,
    duration: 1000,
    translateX: (-Math.floor(map.width * 0.462)),
    translateY: -Math.floor(map.height * 0.2),
  }

  map.animateMapZoom(zoomParams)

  map.createLabels()

  map.createPopulationChoropleth()

  map.animateSectionStyles({ 
    duration: 500, 
    section: '.non-soviet-country', 
    styles: { 
      opacity: '0',
      'stroke-width': '0.175px' 
    }
  })
}

function secondAnimation(map, barChart) {
  map.moveMapContainer({
    duration: 1000,
    top: Math.floor(window.innerHeight * 0.05)
  })
  barChart.fadeTextIn()

}

function thirdAnimation(map, barChart) {
  barChart.animateBarsIn()
  barChart.addPopulationLabels()
  //
  map.addPointsToMap()
  map.drawCurves()
}

function fourthAnimation (map, barChart) {
  map.drawArrows()
}

export default {
  0: zeroAnimation,
  1: firstAnimation,
  2: secondAnimation,
  3: thirdAnimation,
  4: fourthAnimation,
  5: () => {},
  6: () => {}
};
