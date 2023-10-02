import { Action } from 'react-sweet-state';
import { BillingState } from '@source/modules/billing/store/state/types/BillingState';

export const billingValidateCardActions = {
  initInvalidFields: (invalidFields): Action<BillingState> => ({ setState, getState }) => {
    setState({
      payment: {
        ...getState().payment,
        invalidFields,
      },
    });
  },

  resetValidateCard: (): Action<BillingState> => ({ setState, getState }) => {
    setState({
      payment: {
        ...getState().payment,
        invalidFields: {},
        isValidateCard: false,
      },
    });
  },

  setValidateCardField: (key, isValid): Action<BillingState> => ({ setState, getState }) => {
    const { payment } = getState();
    setState({
      payment: { ...payment, invalidFields: { ...payment.invalidFields, [key]: isValid } },
    });
  },

  onValidateCard: (): Action<BillingState> => ({ setState, getState }) => {
    setState({
      payment: {
        ...getState().payment,
        isValidateCard: true,
      },
    });
  },
};
