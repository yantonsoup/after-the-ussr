import chroma from 'chroma-js'

export function createChromaData(populationDataSet) {
    console.warn('createChromaData: chroma dataset', populationDataSet)

    const dataRange = populationDataSet
      .map(country => country.population)
      .sort((a, b) => a - b)
    
    console.warn('dataRange', dataRange)

    const chromaDomain = chroma.scale(['white', 'orange']).domain(dataRange);

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