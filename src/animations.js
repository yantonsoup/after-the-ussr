import {
  netMigrantsToRussia1989to2002,
  percentMigrantsToRussia1989to2002,
  migrationAbroadEthnicity1995to2002,
  migrationAbroadDestination1995to2002,
  populationRussia1989to2002,
  populationsIn1989
} from "./constants";

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
      opacity: '0.1',
      'stroke-width': '0.175px' 
    }
  })
}

function secondAnimation(worldMap, barChart) {
  worldMap.moveMapContainer({
    duration: 1000,
    top: 0
  })
  barChart.revealBarChart()
  barChart.redrawBars(populationsIn1989)
  barChart.addPopulationLabels(populationsIn1989)
}

function thirdAnimation(worldMap, barChart) {
  worldMap.addPointsToMap()
  worldMap.drawCurves()

  const title = 'Net Migration into Russia 1989-2002'
  barChart.drawTitle(title)
  barChart.repaintChart(netMigrantsToRussia1989to2002)
  // worldMap.drawLabelPointer()
}

function fourthAnimation(worldMap, barChart) {
  const title = 'Migration as % of Russians per state'
  barChart.drawTitle(title)
  barChart.paintPercentageChart(percentMigrantsToRussia1989to2002)
}

function fifthAnimation (worldMap, barChart) {
  
}

function sixthAnimation (worldMap, barChart) {
    // worldMap.moveMapContainer({
  //   duration: 1000,
  //   top: graphicMarginTop
  // })

  // barChart.hideAllElements()
  worldMap.animateSectionStyles({ 
    duration: 500, 
    section: '.arc', 
    styles: { 
      opacity: '0',
    }
  })

  worldMap.animateSectionStyles({ 
    duration: 500, 
    section: 'circle', 
    styles: { 
      opacity: '0',
    }
  }) 

  worldMap.animateSectionStyles({ 
    duration: 500, 
    section: '.place-label', 
    styles: { 
      opacity: '0',
    }
  }) 
  
  /* this is the zoom for the germany etc stuff
  const zoomParams = {
    scale: 2,
    duration: 1000,
    translateX: (-Math.floor(worldMap.width * 0.2)),
    translateY: -Math.floor(worldMap.height * 0.2),
  }

  worldMap.animateMapZoom(zoomParams)
  */
 const zoomParams = {
  scale: 2,
  duration: 1000,
  translateX: (-Math.floor(worldMap.width * 0.5)),
  translateY: -Math.floor(worldMap.height * 0.1),
}

worldMap.animateMapZoom(zoomParams)

  worldMap.animateSectionStyles({ 
    duration: 500, 
    section: '.non-soviet-country', 
    styles: { 
      opacity: '0.25',
    }
  })

  const title = 'Russia Population 1989 - 2002'
  barChart.drawTitle(title)
  barChart.repaintChart(populationRussia1989to2002)

}

function seventhAnimation(worldMap, barChart) {
}

function eightAnimation(worldMap, barChart) {

  const title = 'Ethnic Groups Leaving Russia'

  barChart.drawTitle(title)
  barChart.redrawBarsWith3DataPoints(migrationAbroadEthnicity1995to2002)
}


function ninthAnimation(worldMap, barChart) {
  const title = 'Top Destinations For FSU Immigrants'

  barChart.drawTitle(title)
  barChart.redrawBarsWith3DataPoints(migrationAbroadDestination1995to2002)
}

export default {
  0: zeroAnimation,
  1: firstAnimation,
  2: secondAnimation,
  3: thirdAnimation,
  4: fourthAnimation,
  5: fifthAnimation,
  6: sixthAnimation,
  7: seventhAnimation,
  8: eightAnimation,
  9: ninthAnimation,
};
