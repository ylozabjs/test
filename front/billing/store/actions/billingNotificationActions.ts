import { BillingState } from '@source/modules/billing/store/state/types/BillingState';
import { Action } from 'react-sweet-state';
import { MakePrimaryPaymentMethodNotification } from '@source/types/common/MakePrimaryPaymentMethodNotification';
import { sortPaymentMethods } from '@source/modules/billing/store/helpers/sortPaymentMethods';
import { updatePrimaryPaymentMethod } from '@source/modules/billing/store/helpers/updatePrimaryPaymentMethod';
import { RemoveBillingPaymentMethodNotification } from '@source/types/common/RemoveBillingPaymentMethodNotification';
import { IPaymentMethod } from '@source/types/common/IPaymentMethod';

export const billingNotificationActions = {
  nfAddMethod: (paymentMethod: IPaymentMethod): Action<BillingState> => ({ getState, setState }) => {
    const methodList = getState().paymentMethods.list;
    const includesAddedMethod = methodList.some((item) => item.token === paymentMethod.token);

    if (paymentMethod && !includesAddedMethod) {
      setState({
        paymentMethods: {
          ...getState().paymentMethods,
          list: [...methodList, paymentMethod],
        },
      });
    }
  },

  nfEditMethod: (paymentMethod: IPaymentMethod): Action<BillingState> => ({ getState, setState }) => {
    const methodList = getState().paymentMethods.list;

    if (paymentMethod) {
      const changedMethodList = methodList.map((method) =>
        method.token === paymentMethod.token ? paymentMethod : method,
      );

      setState({
        paymentMethods: {
          ...getState().paymentMethods,
          list: sortPaymentMethods(changedMethodList),
        },
      });
    }
  },

  nfMakePrimaryMethod: (data: MakePrimaryPaymentMethodNotification): Action<BillingState> => ({
    getState,
    setState,
  }) => {
    const methodList = getState().paymentMethods.list;
    const includesEditedMethod = methodList.some((item) => item.token === data.makePrimaryToken && item.default);

    if (data && !includesEditedMethod) {
      const changedMethodList = updatePrimaryPaymentMethod(methodList, data.makePrimaryToken);

      setState({
        paymentMethods: {
          ...getState().paymentMethods,
          list: sortPaymentMethods(changedMethodList),
        },
      });
    }
  },

  nfRemoveMethod: (data: RemoveBillingPaymentMethodNotification): Action<BillingState> => ({ getState, setState }) => {
    setState({
      paymentMethods: {
        ...getState().paymentMethods,
        list: sortPaymentMethods(data.list),
      },
    });
  },

  nfAddContact: (list: string[]): Action<BillingState> => ({ getState, setState }) => {
    setState({
      contact: {
        ...getState().contact,
        list: list,
      },
    });
  },

  nfRemoveContact: (list: string[]): Action<BillingState> => ({ getState, setState }) => {
    setState({
      contact: {
        ...getState().contact,
        list: list,
      },
    });
  },
};
