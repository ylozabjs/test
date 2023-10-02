import { BillingService } from '@source/api/services/BillingService';
import { BillingState } from '@source/modules/billing/store/state/types/BillingState';
import { RequestStatusGenerator } from '@source/utils/RequestStatusGenerator';
import { Action } from 'react-sweet-state';
import { Draft, produce } from 'immer';

export const billingPaymentHistoryActions = {
  getBillingHistory: (): Action<BillingState> => async ({ setState, getState }) => {
    if (getState().history.rs.inProgress) {
      return;
    }

    try {
      setState({ history: { ...getState().history, rs: RequestStatusGenerator.request() } });
      const res = await BillingService.getBillingHistory();
      setState({
        history: {
          ...getState().history,
          data: res.data,
          rs: RequestStatusGenerator.success(),
        },
      });
    } catch (e) {
      setState({ history: { ...getState().history, rs: RequestStatusGenerator.failure() } });
    }
  },

  resetBillingHistory: (): Action<BillingState> => ({ getState, setState }) => {
    setState(
      produce(getState(), (draft: Draft<BillingState>) => {
        draft.history.data = null;
        draft.history.rs = RequestStatusGenerator.init();
      }),
    );
  },

  showInvoicePaymentDialog: (): Action<BillingState> => ({ getState, setState }) => {
    setState({ history: { ...getState().history, dlgInvoicePayment: true } });
  },

  hideInvoicePaymentDialog: (): Action<BillingState> => ({ getState, setState }) => {
    setState({ history: { ...getState().history, dlgInvoicePayment: false } });
  },
};
