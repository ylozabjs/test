import { IPaymentMethod } from '@source/types/common/IPaymentMethod';

export const updatePrimaryPaymentMethod = (list: IPaymentMethod[], defaultToken: string): IPaymentMethod[] =>
  list.map((method) => ({ ...method, default: method.token === defaultToken }));
