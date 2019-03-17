import chroma from 'chroma-js'

export function createChromaData(populationDataSet) {
    // console.warn('createChromaData: chroma dataset', populationDataSet)

    const dataRange = populationDataSet
      .map(country => country.population)
      .sort((a, b) => a - b)
      // #F0DF7E
    // console.warn('dataRange', dataRange)
    // const blueSet = ['#9E8CFF', '#8CF3FF'];
    const redSet = ['white', 'orange'];
    const yellowSet = ['#F0DF7E', 'orange'];
    const chromaDomain = chroma.scale(redSet).domain(dataRange);

    const countryColorCodes = populationDataSet.reduce((countryColorsById, country) => {
      // console.warn('country', country)
      const countryColor = chromaDomain(country.population).hex()
      // console.log('%cdadaadadadadadada', `background: ${countryColor}; color: ${countryColor}`);

      return {
        [country.name]: countryColor,
        ...countryColorsById,
      }
    }, {})

    return countryColorCodes;
  }