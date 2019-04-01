import {
  netMigrantsToRussia1989to2002,
  percentMigrantsToRussia1989to2002,
  migrationAbroadEthnicity1995to2002,
  russianPopulationsIn198millions,
  migrationAbroadDestination1995to2002,
  populationRussia1989to2002,
  sovietLabels,
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
 
  worldMap.createPopulationChoropleth(
    populationsIn1989millions,
    ".soviet-country"
  );

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

  Object.keys(sovietLabels).forEach(countryId => {
    const countryShift = sovietLabels[countryId]
    worldMap.createCountryLabel(countryId, countryShift, 3.5);
  })

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

  Object.keys(sovietLabels).forEach(countryId => {
    const countryShift = sovietLabels[countryId]
    worldMap.createCountryLabel(countryId, countryShift, 3.5);
  })
  

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

  barChart.drawTitle(title, "Russian return rate '89-'02");
  barChart.repaintChart(netMigrantsToRussia1989to2002, "m");

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
  // worldMap.addPointsToMap();
  // worldMap.drawCurves();

  ///
  sovietCountryIsoCodes.forEach(country => {
    worldMap.animateArrowFromTo(country, "RUS");
  });
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function fifthAnimation(worldMap, barChart, lineChart, direction) {
  if (direction === "up") {
    lineChart.hideIt();
    barChart.redrawBarsFromScratch(percentMigrantsToRussia1989to2002);
    worldMap.removeLabels();

    worldMap.animateSectionStyles({
      duration: 500,
      section: ".non-soviet-country,.intl-country",
      styles: {
        opacity: "0"
      }
    });

    Object.keys(sovietLabels).forEach(countryId => {
      const countryShift = sovietLabels[countryId]
      worldMap.createCountryLabel(countryId, countryShift, 3.5);
    })

    worldMap.animateSectionStyles({
      duration: 500,
      section: "#RUS",
      styles: {
        opacity: "1",
        fill: "#BAB4AC"
      }
    });

    worldMap.animateSectionStyles({
      duration: 500,
      section: ".fsu-state",
      styles: {
        stroke: "black",
        "stroke-width": "0.1px"
      }
    });

    sovietCountryIsoCodes.forEach(countryId => {
      worldMap.animateArrowFromTo(countryId, "RUS");
    });
  }

  worldMap.animateMapZoom({
    scale: 4,
    duration: 500,
    translateX: -Math.floor(worldMap.width * 0.46),
    translateY: -Math.floor(worldMap.height * 0.22)
  });

  worldMap.createPopulationChoropleth(
    percentMigrantsToRussia1989to2002,
    ".fsu-state"
  );

  barChart.bindDataToBars(percentMigrantsToRussia1989to2002);
  barChart.repaintChart(percentMigrantsToRussia1989to2002, "%");
  barChart.revealBarChart();
  barChart.drawTitle("Percentage return to Russia", "%");
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function sixthAnimation(worldMap, barChart, lineChart, direction) {
  if (direction === "up") {
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
      fill: "rgb(255, 165, 0)",
      opacity: "1"
    }
  });

  lineChart.revealIt();

  lineChart.drawLine("population", [130000000, 150000000], { x: 200, y: 20 });
  lineChart.drawTitle("Russia Population");

  worldMap.createCountryLabel("RUS", [-15, 5], 10);
}

function seventhAnimation(worldMap, barChart, lineChart, direction) {
  lineChart.clearPreviousLineAndAxis("population");
  lineChart.drawLine("fertility", [0, 20], { x: 160, y: 150 });
  lineChart.drawLine("mortality", [0, 20], { x: 150, y: 76 });
  lineChart.drawTitle("Russia fertility & mortality per 1000 persons");

  if (direction === "up") {
    barChart.hideAllElements();
    lineChart.revealIt();
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
        fill: "rgb(255, 165, 0)",
        opacity: "1"
      }
    });
    worldMap.createCountryLabel("RUS", [-8, 8], 12);
  }
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function eightAnimation(worldMap, barChart, lineChart, direction) {
  lineChart.hideIt();
  worldMap.clearArrows();
  worldMap.removeLabels();

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
      opacity: "1",
      stroke: "#d0d0d0"
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
  barChart.drawTitle(
    "Top Destinations For Soviet Immigrants '95 - '02",
    "1995-2002"
  );
  barChart.redrawBarsFromScratch(migrationAbroadDestination1995to2002);
  barChart.revealBarChart();

  if (direction === "up") {
    lineChart.hideIt();
    lineChart.clearPreviousLineAndAxis("germanFsuToGermany");

    worldMap.clearArrows();
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
  if (direction === "down") {
    worldMap.animateSectionStyles({
      duration: 500,
      section: ".non-soviet-country,.soviet-country",
      styles: {
        "stroke-width": "0.15px",
        stroke: "none"
      }
    });

    worldMap.animateMapZoom({
      scale: 7,
      duration: 750,
      translateX: -Math.floor(worldMap.width * 0.4),
      translateY: -Math.floor(worldMap.height * 0.27)
    });

    worldMap.clearArrows();

    const arrowWidth = 0.25;
    const arrowHeadSize = 1;
    const curveOffset = 5;
    worldMap.animateArrowFromTo("RUS", "DEU", "black", arrowWidth, arrowHeadSize, curveOffset);

    worldMap.createCountryLabel("DEU", [-7, 11], 2.5);
  }

  barChart.hideAllElements();

  lineChart.clearPreviousLineAndAxis("fertility");
  lineChart.clearPreviousLineAndAxis("mortality");

  lineChart.revealIt();

  lineChart.drawLine("germanFsuToGermany", [0, 220], { x: 160, y: 70 });
  lineChart.drawTitle("Soviet Migration To Germany 000's");

  // worldMap.highlightInternationalLines();
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function eleventhAnimation(worldMap, barChart, lineChart, direction) {
  if (direction === "up") {
    lineChart.clearPreviousLineAndAxis("jewishFsuToIsrael");

    worldMap.clearArrows();
    const arrowWidth = 0.25;
    const arrowHeadSize = 1;
    const curveOffset = 5;
    worldMap.animateArrowFromTo("RUS", "DEU", "black", arrowWidth, arrowHeadSize, curveOffset);

    worldMap.createCountryLabel("DEU", [-7, 11], 2.5);
    worldMap.animateMapZoom({
      scale: 7,
      duration: 750,
      translateX: -Math.floor(worldMap.width * 0.4),
      translateY: -Math.floor(worldMap.height * 0.27)
    });
  }
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function twelfthAnimation(worldMap, barChart, lineChart, direction) {
  if (direction === "down") {
    worldMap.clearArrows();

    const arrowWidth = 0.15;
    const arrowHeadSize = 0.6;
    worldMap.animateArrowFromTo("RUS", "ISR", "black", arrowWidth, arrowHeadSize);

    worldMap.createCountryLabel("ISR", [-2, 3], 1.5);
    worldMap.animateMapZoom({
      scale: 15,
      duration: 750,
      translateX: -Math.floor(worldMap.width * 0.51),
      translateY: -Math.floor(worldMap.height * 0.382)
    });
  }
  // lineChart.clearPreviousLineAndAxis("germanFsuToGermany");
  lineChart.drawTitle("Soviet Migration To Israel 000's");
  lineChart.drawLine("jewishFsuToIsrael", [0, 220], { x: 130, y: 195 });
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function thirteenthAnimation(worldMap, barChart, lineChart, direction) {
  if (direction === "up") {
    worldMap.clearArrows();
    lineChart.clearPreviousLineAndAxis("americanFsuToUsa");
    worldMap.removeLabels();
    
     const arrowWidth = 0.15;
    const arrowHeadSize = 0.6;
    worldMap.animateArrowFromTo("RUS", "ISR", "black", arrowWidth, arrowHeadSize);
    
    worldMap.createCountryLabel("ISR", [-2, 3], 1.5);
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
function fourteenthAnimation(worldMap, barChart, lineChart, direction) {
  if (direction === 'down') {
    worldMap.clearArrows();
    worldMap.animateArrowFromTo("RUS", "USA", "black");
  
    worldMap.createCountryLabel("USA", [-22, 18], 3);
  }
  // lineChart.clearPreviousLineAndAxis("jewishFsuToIsrael");
  // worldMap.clearArrows();


  lineChart.drawTitle("Soviet Migration To America 000's");
  lineChart.drawLine("americanFsuToUsa", [0, 220], { x: 130, y: 240 });

  worldMap.animateMapZoom({
    scale: 5,
    duration: 500,
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
function sixteeteenthAnimation(worldMap, barChart, lineChart, direction) {
  if (direction === "up") {
    worldMap.moveMapContainer({
      duration: 500,
      top: 0
    });

    worldMap.animateMapZoom({
      scale: 5,
      duration: 500,
      translateX: -Math.floor(worldMap.width * 0.07),
      translateY: -Math.floor(worldMap.height * 0.3)
    });

    lineChart.revealIt();
    worldMap.createCountryLabel("USA", [-22, 18], 3);

    worldMap.clearArrows();
    worldMap.animateArrowFromTo("RUS", "USA", "black");
  }
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function seventeenthAnimation(worldMap, barChart, lineChart) {
  worldMap.clearArrows();
  worldMap.removeLabels();
  lineChart.hideIt();
  const quarterPageHeight = Math.floor(window.innerHeight * 0.25);

  worldMap.moveMapContainer({
    duration: 750,
    top: quarterPageHeight
  });

  worldMap.animateMapZoom({
    scale: 1,
    duration: 500,
    translateX: 0,
    translateY: 0
  });
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
