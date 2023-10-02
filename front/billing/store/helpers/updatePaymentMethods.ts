import { IPaymentMethod } from '@source/types/common/IPaymentMethod';

export const updatePaymentMethods = (paymentMethods: IPaymentMethod[], data: IPaymentMethod): IPaymentMethod[] => {
  return paymentMethods.map((method) => {
    if (method.token === data.token) {
      return data;
    } else {
      if (method.billingAddress.id === data.billingAddress.id) {
        return { ...method, billingAddress: data.billingAddress };
      }
      return method;
    }
  });
};