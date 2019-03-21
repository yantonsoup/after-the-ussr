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
    duration: 500,
    section: ".place-label",
    styles: {
      opacity: "0"
    }
  });

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".non-soviet-country",
    styles: {
      opacity: "0.5",
      fill: "#d0d0d0",
    }
  });

  const zoomParams = {
    scale: 1,
    duration: 750,
    translateX: 0,
    translateY: 0
  };

  worldMap.animateMapZoom(zoomParams);
  worldMap.createPopulationChoropleth(populationsIn1989millions);
}

function firstAnimation(worldMap, barChart, lineChart) {
  const quarterPageHeight = Math.floor(window.innerHeight * 0.25);

  worldMap.moveMapContainer({
    duration: 750,
    top: quarterPageHeight
  });
  
  const zoomParams = {
    scale: 4,
    duration: 1000,
    translateX: -Math.floor(worldMap.width * 0.462),
    translateY: -Math.floor(worldMap.height * 0.2)
  };

  worldMap.animateMapZoom(zoomParams);

  worldMap.createLabels();

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".non-soviet-country",
    styles: {
      opacity: "0",
      // "stroke-width": "0.175px"
    }
  });

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".soviet-country",
    styles: {
      "stroke-width": "0.1px"
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

function secondAnimation(worldMap, barChart) {
  worldMap.moveMapContainer({
    duration: 1000,
    top: 0
  });

  barChart.revealBarChart();
  // barChart.redrawBars(populationsIn1989millions);
  const title = "1898 Soviet State Populations";
  barChart.drawTitle(title, "m");
  barChart.repaintChart(populationsIn1989millions);

  barChart.addPopulationLabels(populationsIn1989millions);
  worldMap.animateSectionStyles({
    duration: 500,
    section: ".non-soviet-country",
    styles: {
      opacity: "0"
    }
  });

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".place-label",
    styles: {
      opacity: "1"
    }
  });

  worldMap.createPopulationChoropleth(populationsIn1989millions);
}

function thirdAnimation(worldMap, barChart) {

  // worldMap.animateSectionStyles({
  //   duration: 500,
  //   section: "#RUS",
  //   styles: {
  //     fill: "#d0d0d0"
  //   }
  // });


  const title = "Russian populations 1989";

  worldMap.createPopulationChoropleth(russianPopulationsIn1989thousands);

  barChart.drawTitle(title, "thou");
  barChart.repaintChart(russianPopulationsIn1989thousands);

  // hide curves and dot on way up
  worldMap.animateSectionStyles({
    duration: 500,
    section: ".arc",
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
}

function fourthAnimation(worldMap, barChart) {
  const title = "Net return '89-'02";

  // worldMap.drawLabelPointer()
  barChart.drawTitle(title, "thou");
  barChart.repaintChart(netMigrantsToRussia1989to2002);

  // on way up
  const zoomParams = {
    scale: 4,
    duration: 800,
    translateX: -Math.floor(worldMap.width * 0.462),
    translateY: -Math.floor(worldMap.height * 0.2)
  };

  worldMap.animateMapZoom(zoomParams);
  worldMap.createPopulationChoropleth(netMigrantsToRussia1989to2002);
  worldMap.addPointsToMap();
  worldMap.drawCurves();

  // worldMap.animateSectionStyles({
  //   duration: 1000,
  //   section: ".arc",
  //   styles: {
  //     opacity: "0"
  //   }
  // });
}

function fifthAnimation(worldMap, barChart) {
  worldMap.animateSectionStyles({
    duration: 500,
    section: ".arc",
    styles: {
      opacity: "1"
    }
  });

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".place-label",
    styles: {
      opacity: "1"
    }
  });

  worldMap.animateSectionStyles({
    duration: 500,
    section: "circle",
    styles: {
      opacity: "1"
    }
  });

  const title = "Percentage return to Russia";

  barChart.drawTitle(title, "%");
  barChart.repaintChart(percentMigrantsToRussia1989to2002);
  // // up
  // worldMap.animateSectionStyles({
  //   duration: 500,
  //   section: ".soviet-country",
  //   styles: {
  //     opacity: "1"
  //   }
  // });
  


  const zoomParams = {
    scale: 4,
    duration: 800,
    translateX: -Math.floor(worldMap.width * 0.462),
    translateY: -Math.floor(worldMap.height * 0.2)
  };

  worldMap.animateMapZoom(zoomParams);
  worldMap.createPopulationChoropleth(percentMigrantsToRussia1989to2002);
  barChart.revealBarChart();

}

/* ************ ****** ****** ****** ****** ******  */
function sixthAnimation(worldMap, barChart, lineChart) {

  barChart.hideAllElements();

  lineChart.revealIt()

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".arc",
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

  worldMap.animateSectionStyles({
    duration: 500,
    section: "#RUS",
    styles: {
      opacity: "1",
        fill: "#BAB4AC",
    }
  });

  // worldMap.animateSectionStyles({
  //   duration: 500,
  //   section: ".non-soviet-country",
  //   styles: {
  //     fill: "#d0d0d0",
  //     opacity: "0.5"
  //   }
  // });

    // worldMap.animateSectionStyles({
  //   duration: 500,
  //   section: ".soviet-country",
  //   styles: {
  //     opacity: "0.5",
  //     fill: "#d0d0d0",
  //     "stroke-width": '0'
  //   }
  // });
}

function seventhAnimation(worldMap, barChart) {
  const title = "Top Destinations For FSU Immigrants";

  barChart.drawTitle(title, '1995-2002');
  barChart.redrawBarsWith3DataPoints(migrationAbroadDestination1995to2002);

}

function eightAnimation(worldMap, barChart) {
  barChart.revealBarChart();

  const zoomParams = {
    scale: 1,
    duration: 750,
    translateX: 0,
    translateY: 0
  };

  worldMap.animateMapZoom(zoomParams);

 

  worldMap.highlightInternationalCountries(migrationAbroadDestination1995to2002);
  worldMap.applyInitialHighlight();
  // worldMap.animateSectionStyles({
  //   duration: 1000,
  //   section: ".non-soviet-country",
  //   styles: {
  //     opacity: "0.5",
  //     "stroke-width": "0.25px"
  //   }
  // });
  worldMap.animateSectionStyles({
    duration: 500,
    section: ".fsu-state",
    styles: {
      // 'stroke-opacity': "0.9",
      "stroke-width": "0px",
      "stroke": "#BAB4AC",
      "fill": "#BAB4AC",
      "fill": "#BAB4AC"
    }
  });
  worldMap.animateSectionStyles({
    duration: 500,
    section: "#USA",
    styles: {
      opacity: "1"
    }
  });

  worldMap.animateSectionStyles({
    duration: 500,
    section: "#DEU",
    styles: {
      opacity: "1"
    }
  });

  worldMap.animateSectionStyles({
    duration: 500,
    section: "#ISR",
    styles: {
      opacity: "1"
    }
  });
}

function ninthAnimation(worldMap, barChart) {


  const zoomParams = {
    scale: 4,
    duration: 750,
    translateX: -Math.floor(worldMap.width * 0.4),
    translateY: -Math.floor(worldMap.height * 0.22)
  };
  worldMap.highlightInternationalLines();

  worldMap.animateMapZoom(zoomParams);

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".arc",
    styles: {
      opacity: "0"
    }
  });

  worldMap.animateSectionStyles({
    duration: 500,
    section: "#arc-DEU",
    styles: {
      opacity: "1",
    }
  });

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".non-soviet-country",
    styles: {
      "stroke-width": "0.15px"
    }
  });
}

function tenthAnimation(worldMap, barChart) {
  worldMap.animateSectionStyles({
    duration: 1000,
    section: "#arc-DEU",
    styles: {
      opacity: "0"
    }
  });

  worldMap.animateSectionStyles({
    duration: 1000,
    section: "#DEU",
    styles: {
      fill: "#d0d0d0",
      opacity: "0.5"
    }
  });

  worldMap.animateSectionStyles({
    duration: 1000,
    section: "#arc-ISR",
    styles: {
      opacity: "1"
    }
  });

    
  const zoomParams = {
    scale: 15,
    duration: 1000,
    translateX: -Math.floor(worldMap.width * 0.5),
    translateY: -Math.floor(worldMap.height * 0.38)
  };

  worldMap.animateMapZoom(zoomParams);
}

// function tenthAnimation(worldMap, barChart) {}

function eleventhAnimation(worldMap, barChart) {
  const zoomParams = {
    scale: 5,
    duration: 750,
    translateX: -Math.floor(worldMap.width * 0.08),
    translateY: -Math.floor(worldMap.height * 0.3)
  };

  worldMap.animateMapZoom(zoomParams);

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
      opacity: "0"
    }
  });

  worldMap.animateSectionStyles({
    duration: 1000,
    section: "#arc-USA",
    styles: {
      opacity: "1"
    }
  });
}

function twelfthAnimation(worldMap, barChart) {
  worldMap.animateSectionStyles({
    duration: 1000,
    section: ".arc",
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

  worldMap.animateMapZoom(zoomParams);
}

function thirteenthAnimation(worldMap, barChart) {
  worldMap.animateSectionStyles({
    duration: 1000,
    section: ".arc",
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

  worldMap.animateMapZoom(zoomParams);
}

function fourteenthAnimation (worldMap, barChart) {

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
  10: tenthAnimation,
  11: eleventhAnimation,
  12: twelfthAnimation,
  13: thirteenthAnimation,
  14: fourteenthAnimation,
};
