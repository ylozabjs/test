import { Action } from 'react-sweet-state';
import { BillingState } from '@source/modules/billing/store/state/types/BillingState';
import { PaymentMethod } from '@source/types/common/PaymentMethod';

export const billingPaymentMethodsDialogActions = {
  showRemovePaymentMethodDialog: (selected: PaymentMethod): Action<BillingState> => ({ setState, getState }) => {
    setState({ paymentMethods: { ...getState().paymentMethods, dlgRemove: true, selected } });
  },

  hideRemovePaymentMethodDialog: (): Action<BillingState> => ({ setState, getState }) => {
    setState({ paymentMethods: { ...getState().paymentMethods, dlgRemove: false, selected: null } });
  },

  showMakePrimaryMethodDialog: (selected: PaymentMethod): Action<BillingState> => ({ setState, getState }) => {
    setState({ paymentMethods: { ...getState().paymentMethods, dlgMakePrimary: true, selected } });
  },

  hideMakePrimaryMethodDialog: (): Action<BillingState> => ({ setState, getState }) => {
    setState({ paymentMethods: { ...getState().paymentMethods, dlgMakePrimary: false, selected: null } });
  },

  showAlertDialog: (): Action<BillingState> => ({ setState, getState }) => {
    setState({ paymentMethods: { ...getState().paymentMethods, dlgAlert: true } });
  },

  hideAlertDialog: (): Action<BillingState> => ({ setState, getState }) => {
    setState({ paymentMethods: { ...getState().paymentMethods, dlgAlert: false, error: '' } });
  },

  showAddPaymentMethodDialog: (): Action<BillingState> => ({ setState, getState }) => {
    setState({ payment: { ...getState().payment, dlgAdd: true } });
  },

  hideAddPaymentMethodDialog: (): Action<BillingState> => ({ setState, getState }) => {
    setState({ payment: { ...getState().payment, dlgAdd: false } });
  },

  showEditPaymentMethodDialog: (item): Action<BillingState> => ({ setState, getState }) => {
    setState({ payment: { ...getState().payment, dlgEdit: true, selected: item } });
  },

  hideEditPaymentMethodDialog: (): Action<BillingState> => ({ setState, getState }) => {
    setState({ payment: { ...getState().payment, dlgEdit: false, selected: null } });
  },

  showSaveBillingInfoDialog: (): Action<BillingState> => ({ setState, getState }) => {
    setState({ billingInfo: { ...getState().billingInfo, dlgSave: true } });
  },

  hideSaveBillingInfoDialog: (): Action<BillingState> => ({ setState, getState }) => {
    setState({ billingInfo: { ...getState().billingInfo, dlgSave: false } });
  },
};
