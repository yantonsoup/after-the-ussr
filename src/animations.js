import {
  netMigrantsToRussia1989to2002,
  percentMigrantsToRussia1989to2002,
  migrationAbroadEthnicity1995to2002,
  russianPopulationsIn1989thousands,
  migrationAbroadDestination1995to2002,
  populationRussia1989to2002,
  populationsIn1989millions
} from "./constants";

function zeroAnimation(worldMap) {
  worldMap.animateSectionStyles({
    duration: 100,
    section: ".soviet-country",
    styles: {
      fill: "#fcd116",
    }
  });

  worldMap.animateSectionStyles({
    duration: 1000,
    section: ".non-soviet-country",
    styles: {
      opacity: "0.5",
      "stroke-width": "0.25px"
    }
  });

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".place-label",
    styles: {
      opacity: "0"
    }
  });

  const zoomParams = {
    scale: 1,
    duration: 1000,
    translateX: 0,
    translateY: 0
  };

  worldMap.animateMapZoom(zoomParams)
}

function firstAnimation(worldMap) {
  const zoomParams = {
    scale: 4,
    duration: 1000,
    translateX: -Math.floor(worldMap.width * 0.462),
    translateY: -Math.floor(worldMap.height * 0.2)
  };

  worldMap.animateMapZoom(zoomParams);

  worldMap.createLabels();

  worldMap.createPopulationChoropleth();

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".non-soviet-country",
    styles: {
      opacity: "0",
      "stroke-width": "0.175px"
    }
  });

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".place-label",
    styles: {
      opacity: "1"
    }
  });

  const quarterPageHeight = Math.floor(window.innerHeight * 0.25);
  worldMap.moveMapContainer({
    duration: 1000,
    top: quarterPageHeight
  });
}

function secondAnimation(worldMap, barChart) {
  worldMap.moveMapContainer({
    duration: 1000,
    top: 0
  });

  barChart.revealBarChart();
  barChart.redrawBars(populationsIn1989millions);
  barChart.addPopulationLabels(populationsIn1989millions);
  worldMap.animateSectionStyles({
    duration: 500,
    section: ".non-soviet-country",
    styles: {
      opacity: "0",
    }
  });

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".place-label",
    styles: {
      opacity: "1"
    }
  });
}

function thirdAnimation(worldMap, barChart) {
  const title = "Russian populations 1989";
  barChart.drawTitle(title, "thou");
  barChart.repaintChart(russianPopulationsIn1989thousands);
}

function fourthAnimation(worldMap, barChart) {
  worldMap.addPointsToMap();
  worldMap.drawCurves();

  // worldMap.drawLabelPointer()
  const title = "Net return '89-'02";
  barChart.drawTitle(title, "thou");
  barChart.repaintChart(netMigrantsToRussia1989to2002);

  // worldMap.animateSectionStyles({
  //   duration: 1000,
  //   section: ".arc",
  //   styles: {
  //     opacity: "0"
  //   }
  // });
}

/* ************ ****** ****** ****** ****** ******  */
function fifthAnimation(worldMap, barChart) {
  worldMap.animateSectionStyles({
    duration: 500,
    section: ".arc",
    styles: {
      opacity: "0"
    }
  });

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".place-label",
    styles: {
      opacity: "0"
    }
  });

  worldMap.animateSectionStyles({
    duration: 500,
    section: "circle",
    styles: {
      opacity: "0"
    }
  });

  barChart.hideAllElements();

  const graphicMarginTop = Math.floor(window.innerHeight * 0.25);

  worldMap.moveMapContainer({
    duration: 1000,
    top: graphicMarginTop
  });

  const zoomParams = {
    scale: 1,
    duration: 1000,
    translateX: 0,
    translateY: 0
  };

  worldMap.animateMapZoom(zoomParams);
  worldMap.animateSectionStyles({
    duration: 500,
    section: ".soviet-country",
    styles: {
      opacity: "0.5",
      fill: "#d0d0d0"
    }
  });


  worldMap.animateMapZoom(zoomParams);
  worldMap.animateSectionStyles({
    duration: 500,
    section: "#RUS",
    styles: {
      opacity: "1",
      fill: "#fcd116"
    }
  });

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".non-soviet-country",
    styles: {
      fill: '#d0d0d0',
      opacity: "0.5",
    }
  });
}


function sixthAnimation(worldMap, barChart) {
  const title = "Top Destinations For FSU Immigrants";

  barChart.drawTitle(title);
  barChart.redrawBarsWith3DataPoints(migrationAbroadDestination1995to2002);

  const zoomParams = {
    scale: 2,
    duration: 1000,
    translateX: -Math.floor(worldMap.width * 0.17),
    translateY: -Math.floor(worldMap.height * 0.2)
  };

  worldMap.animateMapZoom(zoomParams);
  worldMap.animateSectionStyles({
    duration: 500,
    section: ".soviet-country",
    styles: {
      opacity: "1",
      fill: "#fcd116"
    }
  });

  worldMap.animateWorldSections(zoomParams);

  worldMap.animateSectionStyles({
    duration: 1000,
    section: ".non-soviet-country",
    styles: {
      opacity: "0.5",
      "stroke-width": "0.25px"
    }
  });

}

function seventhAnimation(worldMap, barChart) {
  const zoomParams = {
    scale: 4,
    duration: 1000,
    translateX: -Math.floor(worldMap.width * 0.4),
    translateY: -Math.floor(worldMap.height * 0.2)
  };

  worldMap.animateMapZoom(zoomParams);

  worldMap.animateSectionStyles({
    duration: 1000,
    section: ".arc",
    styles: {
      opacity: "0"
    }
  });

  worldMap.animateSectionStyles({
    duration: 1000,
    section: "#arc-DEU",
    styles: {
      opacity: "1"
    }
  });
}

function ninthAnimation(worldMap, barChart) {
  worldMap.animateSectionStyles({
    duration: 1000,
    section: "#arc-DEU",
    styles: {
      opacity: "0"
    }
  });

  worldMap.animateSectionStyles({
    duration: 1000,
    section: "#arc-ISR",
    styles: {
      opacity: "1"
    }
  });
}

function eightAnimation(worldMap, barChart) {

}

function tenthAnimation(worldMap, barChart) {
  // Zoom to Germany -> DONE
  // hide other arcs
  // animate bars?
}

function eleventhAnimation(worldMap, barChart) {}

function twelfthAnimation(worldMap, barChart) {}

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
  10: tenthAnimation,
  11: eleventhAnimation,
  12: twelfthAnimation
};
