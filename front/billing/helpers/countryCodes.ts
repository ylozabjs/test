import { Country } from '@source/types/common/Country';

const getCurrency = (countries: Country[], countryCode: string): string => {
  if (countryCode === 'GB') {
    return 'GBP';
  }

  if (getCountry(countries, countryCode).sepa) {
    return 'EUR';
  }

  return 'USD';
};

const getCountry = (countries: Country[], countryCode: string): Country | Record<string, never> =>
  countries.find(({ value }) => value === countryCode) || {};

export const countryCodes = {
  getCurrency,
  getCountry,
};
