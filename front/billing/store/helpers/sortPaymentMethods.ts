import { sortBy } from 'lodash';

export const sortPaymentMethods = <T>(list: T[]): T[] => sortBy(list, (method) => (method.default ? 0 : 1));
