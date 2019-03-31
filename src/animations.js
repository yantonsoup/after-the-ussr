import {
  netMigrantsToRussia1989to2002,
  percentMigrantsToRussia1989to2002,
  migrationAbroadEthnicity1995to2002,
  russianPopulationsIn198millions,
  migrationAbroadDestination1995to2002,
  populationRussia1989to2002,
  populationsIn1989millions
} from "./constants";

const sovietCountryIsoCodes = [
  "ARM",
  "AZE",
  "BLR",
  "EST",
  "GEO",
  "KAZ",
  "KGZ",
  "LVA",
  "LTU",
  "MDA",
  "TJK",
  "TKM",
  "UKR",
  "UZB"
];

// /////////////////////////////////////////////////////////
function zeroAnimation(worldMap, barChart, lineChart, direction) {
  console.warn("direction yp", direction);
  if (direction === "down") {
    console.warn("direction", direction);
    worldMap.createPopulationChoropleth(
      populationsIn1989millions,
      ".soviet-country"
    );
  } else {
    worldMap.removeLabels();
    worldMap.animateSectionStyles({
      duration: 500,
      section: ".non-soviet-country,.intl-country",
      styles: {
        opacity: "0.5",
        fill: "#d0d0d0",
        stroke: "none"
      }
    });
    worldMap.animateMapZoom({
      scale: 1,
      duration: 750,
      translateX: 0,
      translateY: 0
    });
  }
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function firstAnimation(worldMap, barChart, lineChart, direction) {
  const quarterPageHeight = Math.floor(window.innerHeight * 0.25);

  worldMap.moveMapContainer({
    duration: 750,
    top: quarterPageHeight
  });

  worldMap.animateMapZoom({
    scale: 4,
    duration: 1000,
    translateX: -Math.floor(worldMap.width * 0.46),
    translateY: -Math.floor(worldMap.height * 0.22)
  });

  worldMap.createLabels();

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".non-soviet-country,.intl-country",
    styles: {
      opacity: "0",
      "stroke-width": "0.175px"
    }
  });

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".soviet-country",
    styles: {
      stroke: "black",
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
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function secondAnimation(worldMap, barChart) {
  worldMap.moveMapContainer({
    duration: 1000,
    top: 0
  });

  barChart.revealBarChart();

  barChart.clearBars();
  barChart.bindDataToBars(populationsIn1989millions);
  barChart.paintHiddenBars(populationsIn1989millions);

  // barChart.redrawBars(populationsIn1989millions);
  barChart.drawTitle("1898 Soviet State Populations");
  barChart.repaintChart(populationsIn1989millions, "m");

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".non-soviet-country,.intl-country",
    styles: {
      opacity: "0"
    }
  });

  worldMap.createLabels();

  worldMap.createPopulationChoropleth(populationsIn1989millions, ".fsu-state");
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function thirdAnimation(worldMap, barChart) {
  barChart.clearBars();
  barChart.bindDataToBars(russianPopulationsIn198millions);
  barChart.paintHiddenBars(russianPopulationsIn198millions);

  const title = "Russian populations / state 1989";

  barChart.drawTitle(title, "m");
  barChart.repaintChart(russianPopulationsIn198millions, "m");

  // barChart.revealBarChart();

  // hide curves and dot on way up
  worldMap.createPopulationChoropleth(
    russianPopulationsIn198millions,
    ".fsu-state"
  );

  worldMap.animateSectionStyles({
    duration: 500,
    section: "#RUS",
    styles: {
      opacity: "1",
      fill: "#BAB4AC"
    }
  });

  worldMap.clearArrows();
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function fourthAnimation(worldMap, barChart) {
  const title = "Russian return rate '89-'02";

  barChart.drawTitle(title, "thou");
  barChart.repaintChart(netMigrantsToRussia1989to2002, "thou");

  // on way up
  const zoomParams = {
    scale: 4,
    duration: 1000,
    translateX: -Math.floor(worldMap.width * 0.46),
    translateY: -Math.floor(worldMap.height * 0.22)
  };

  worldMap.animateMapZoom(zoomParams);
  worldMap.createPopulationChoropleth(
    netMigrantsToRussia1989to2002,
    ".fsu-state"
  );
  worldMap.addPointsToMap();
  // worldMap.drawCurves();

  ///
  sovietCountryIsoCodes.forEach(country => {
    worldMap.animateArrowFromTo(country, "RUS");
  });
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function fifthAnimation(worldMap, barChart) {
  worldMap.animateMapZoom({
    scale: 4,
    duration: 1000,
    translateX: -Math.floor(worldMap.width * 0.46),
    translateY: -Math.floor(worldMap.height * 0.22)
  });

  worldMap.createPopulationChoropleth(
    percentMigrantsToRussia1989to2002,
    ".fsu-state"
  );

  worldMap.animateSectionStyles({
    duration: 500,
    section: "circle",
    styles: {
      opacity: "1"
    }
  });

  barChart.repaintChart(percentMigrantsToRussia1989to2002, "%");
  barChart.revealBarChart();
  barChart.drawTitle("Percentage return to Russia", "%");
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function sixthAnimation(worldMap, barChart, lineChart, direction) {
  if (direction === 'up') {
    lineChart.clearPreviousLineAndAxis("fertility");
    lineChart.clearPreviousLineAndAxis("mortality");
  }

  barChart.hideAllElements();

  worldMap.clearArrows();
  worldMap.removeLabels();


  worldMap.animateMapZoom({
    scale: 1,
    duration: 750,
    translateX: 0,
    translateY: 0
  });

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".country",
    styles: {
      opacity: "0.5",
      fill: "#d0d0d0",
      stroke: "#d0d0d0",
      "stroke-opacity": 0.5
    }
  });

  worldMap.animateSectionStyles({
    duration: 1000,
    section: "#RUS",
    styles: {
      fill: "rgb(255, 165, 0)"
    }
  });

  lineChart.revealIt();

  lineChart.drawLine("population", [130000000, 150000000], {x: 200, y:20});
  lineChart.drawTitle("Russia Population");

  worldMap.createCountryLabel("RUS", [-8, 8], 12);
}

function seventhAnimation(worldMap, barChart, lineChart, direction) {
  lineChart.clearPreviousLineAndAxis("population");
  lineChart.drawLine("fertility", [0, 20], {x: 160, y:140});
  lineChart.drawLine("mortality", [0, 20], {x: 150, y:76});
  lineChart.drawTitle("Russia fertility & mortality per 1000 persons");

  if (direction === 'up') {
    barChart.hideAllElements();
    lineChart.revealIt();
  }
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function eightAnimation(worldMap, barChart, lineChart, direction) {
  lineChart.hideIt();
  worldMap.clearArrows();
  worldMap.removeLabels()

  worldMap.animateMapZoom({
    scale: 1,
    duration: 500,
    translateX: 0,
    translateY: 0
  });


  worldMap.animateSectionStyles({
    duration: 1000,
    section: ".soviet-country",
    styles: {
      fill: "#d0d0d0",
      opacity: '1',
      stroke: "#d0d0d0",
    }
  });

  worldMap.createPopulationChoropleth(
    migrationAbroadDestination1995to2002,
    ".intl-country",
    ["#ffffb2", "#a1dab4", "#41b6c4"]
  );

}
// /////////////////////////////////////////////////////////

// ////////////////////////////////x/////////////////////////
function ninthAnimation(worldMap, barChart, lineChart, direction) {

  barChart.drawTitle("Top Destinations For Soviet Immigrants '95 - '02", "1995-2002");
  barChart.redrawBarsWith3DataPoints(migrationAbroadDestination1995to2002);
  barChart.revealBarChart();

  if (direction === 'up') {
    lineChart.hideIt();

    worldMap.animateMapZoom({
      scale: 1,
      duration: 500,
      translateX: 0,
      translateY: 0
    });
  }

}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function tenthAnimation(worldMap, barChart, lineChart, direction) {
  if (direction === 'down') {
    barChart.hideAllElements();

    lineChart.clearPreviousLineAndAxis("fertility");
    lineChart.clearPreviousLineAndAxis("mortality");
  
  
    lineChart.revealIt();

    lineChart.drawLine("germanFsuToGermany", [0, 220],  {x: 160, y:70});
    lineChart.drawTitle("Soviet Migration To Germany 000's");
  }


  // worldMap.highlightInternationalLines();
  worldMap.animateSectionStyles({
    duration: 500,
    section: ".non-soviet-country,.soviet-country",
    styles: {
      "stroke-width": "0.15px",
      stroke: 'none'
    }
  });

  worldMap.animateMapZoom({
    scale: 7,
    duration: 750,
    translateX: -Math.floor(worldMap.width * 0.4),
    translateY: -Math.floor(worldMap.height * 0.27)
  });

  worldMap.clearArrows();
  worldMap.animateArrowFromTo("RUS", "DEU", 'black', 0.25);
  worldMap.createCountryLabel("DEU", [-7, 11], 2.5);
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function eleventhAnimation(worldMap, barChart, lineChart) {}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function twelfthAnimation(worldMap, barChart, lineChart) {
  worldMap.clearArrows();
  worldMap.animateArrowFromTo("RUS", "ISR", 'black', 0.15);
  worldMap.createCountryLabel("ISR", [-2, 3], 1.5);
  worldMap.animateMapZoom({
    scale: 15,
    duration: 750,
    translateX: -Math.floor(worldMap.width * 0.51),
    translateY: -Math.floor(worldMap.height * 0.382)
  });


  // lineChart.clearPreviousLineAndAxis("germanFsuToGermany");
  lineChart.drawTitle("Soviet Migration To Israel 000's");
  lineChart.drawLine("jewishFsuToIsrael", [0, 220],  {x: 130, y:195});
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function thirteenthAnimation(worldMap, barChart, lineChart, direction) {
  if (direction === 'up') {
    worldMap.animateMapZoom({
      scale: 15,
      duration: 750,
      translateX: -Math.floor(worldMap.width * 0.51),
      translateY: -Math.floor(worldMap.height * 0.382)
    });
  }
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function fourteenthAnimation(worldMap, barChart, lineChart) {
  // lineChart.clearPreviousLineAndAxis("jewishFsuToIsrael");

  lineChart.drawTitle("Soviet American Migr.", "000's");
  lineChart.drawLine("americanFsuToUsa", [0, 220], {x: 130, y:240});

  worldMap.animateArrowFromTo("RUS", "USA", 'black', 0.3);
  worldMap.createCountryLabel("USA", [-22, 18], 3);

  worldMap.clearArrows();
  worldMap.animateMapZoom({
    scale: 5,
    duration: 750,
    translateX: -Math.floor(worldMap.width * 0.07),
    translateY: -Math.floor(worldMap.height * 0.3)
  });
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function fifteenthAnimation(worldMap, barChart, lineChart) {
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function sixteeteenthAnimation(worldMap, barChart, lineChart) {
  worldMap.moveMapContainer({
    duration: 1000,
    top: 0
  });

  worldMap.animateMapZoom({
    scale: 5,
    duration: 750,
    translateX: -Math.floor(worldMap.width * 0.07),
    translateY: -Math.floor(worldMap.height * 0.3)
  });

  lineChart.revealIt();
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function seventeenthAnimation(worldMap, barChart, lineChart) {
  worldMap.removeLabels()
  lineChart.hideIt();
  const quarterPageHeight = Math.floor(window.innerHeight * 0.25);

  worldMap.moveMapContainer({
    duration: 750,
    top: quarterPageHeight
  });

  const zoomParams = {
    scale: 1,
    duration: 1000,
    translateX: 0,
    translateY: 0
  };

  worldMap.animateMapZoom(zoomParams);
  worldMap.createPopulationChoropleth(
    populationsIn1989millions,
    ".soviet-country"
  );
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function eighteenthAnimation() {}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function nineteenthAnimation() {}
// /////////////////////////////////////////////////////////

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
  15: fifteenthAnimation,
  16: sixteeteenthAnimation,
  17: seventeenthAnimation,
  18: eighteenthAnimation,
  19: nineteenthAnimation
};
