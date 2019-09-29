import chroma from "chroma-js";

const redSet = ["white", "orange"];
const orangeSet = ["#ffffb2", "#fd8d3c"];
const blueSet = ["#ffffcc", "#a1dab4", "#41b6c4"];

export default (populationDataSet, scale = redSet) => {
  // console.warn('createChromaColorSet: chroma dataset', populationDataSet)

  const dataRange = populationDataSet
    .map(country => country.population)
    .sort((a, b) => a - b);
  // #F0DF7E
  // console.warn('dataRange', dataRange)
  // const blueSet = ['#9E8CFF', '#8CF3FF'];
  const yellowSet = ["#F0DF7E", "orange"];
  const chromaDomain = chroma.scale(scale).domain(dataRange);

  const countryColorCodes = populationDataSet.reduce(
    (countryColorsById, country) => {
      // console.warn('country', country)
      const countryColor = chromaDomain(country.population).hex();
      // console.log('%cdadaadadadadadada', `background: ${countryColor}; color: ${countryColor}`);

      return {
        [country.name]: countryColor,
        ...countryColorsById
      };
    },
    {}
  );

  return countryColorCodes;
};
