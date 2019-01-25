function zeroAnimation(worldMap) {
  worldMap.animateSectionStyles({ 
    duration: 1000, 
    section: '.non-soviet-country', 
    styles: { 
      opacity: '0.5',
      'stroke-width': '0.25px' 
    }
  })
}

function firstAnimation(worldMap) {
  const zoomParams = {
    scale: 4,
    duration: 1000,
    translateX: (-Math.floor(worldMap.width * 0.462)),
    translateY: -Math.floor(worldMap.height * 0.2),
  }

  worldMap.animateMapZoom(zoomParams)

  worldMap.createLabels()

  worldMap.createPopulationChoropleth()

  worldMap.animateSectionStyles({ 
    duration: 500, 
    section: '.non-soviet-country', 
    styles: { 
      opacity: '0',
      'stroke-width': '0.175px' 
    }
  })
}

function secondAnimation(worldMap, barChart) {
  worldMap.moveMapContainer({
    duration: 1000,
    top: Math.floor(window.innerHeight * 0.05)
  })
  barChart.fadeTextIn()

}

function thirdAnimation(worldMap, barChart) {
  barChart.animateBarsIn()
  barChart.addPopulationLabels()
  //
  worldMap.addPointsToMap()
}

function fourthAnimation(worldMap) {
  worldMap.drawCurves()
  worldMap.drawArrows()
}

function fifthAnimation (worldMap, barChart) {
}

export default {
  0: zeroAnimation,
  1: firstAnimation,
  2: secondAnimation,
  3: thirdAnimation,
  4: fourthAnimation,
  5: fifthAnimation,
  6: () => {}
};
