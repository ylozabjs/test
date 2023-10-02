import { Action } from 'react-sweet-state';
import { BillingState } from '@source/modules/billing/store/state/types/BillingState';

export const billingContactDialogActions = {
  showAddContactDialog: (): Action<BillingState> => ({ setState, getState }) => {
    setState({ contact: { ...getState().contact, dlgAdd: true } });
  },

  hideAddContactDialog: (): Action<BillingState> => ({ setState, getState }) => {
    setState({ contact: { ...getState().contact, dlgAdd: false } });
  },

  showRemoveContactDialog: (selected: string): Action<BillingState> => ({ setState, getState }) => {
    setState({ contact: { ...getState().contact, dlgRemove: true, selected } });
  },

  hideRemoveContactDialog: (): Action<BillingState> => ({ setState, getState }) => {
    setState({ contact: { ...getState().contact, dlgRemove: false, selected: '' } });
  },
};
