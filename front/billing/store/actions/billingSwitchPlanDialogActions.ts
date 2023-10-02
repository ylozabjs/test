import { produce, Draft } from 'immer';
import { Action } from 'react-sweet-state';
import { BillingState } from '@source/modules/billing/store/state/types/BillingState';

export const billingSwitchPlanDialogActions = {
  showCongratulationDialog: (): Action<BillingState> => ({ setState, getState }) => {
    setState(
      produce(getState(), (draft: Draft<BillingState>) => {
        draft.confirmPlan.dlgCongrat = true;
      }),
    );
  },

  hideCongratulationDialog: (): Action<BillingState> => ({ setState, getState }) => {
    setState(
      produce(getState(), (draft: Draft<BillingState>) => {
        draft.confirmPlan.dlgCongrat = false;
      }),
    );
  },

  showSwitchAlertDialog: (): Action<BillingState> => ({ setState, getState }) => {
    setState(
      produce(getState(), (draft: Draft<BillingState>) => {
        draft.confirmPlan.dlgAlert = true;
      }),
    );
  },

  hideSwitchAlertDialog: (): Action<BillingState> => ({ setState, getState }) => {
    setState(
      produce(getState(), (draft: Draft<BillingState>) => {
        draft.confirmPlan.dlgAlert = false;
      }),
    );
  },

  showSwitchDialog: (): Action<BillingState> => ({ setState, getState }) => {
    setState(
      produce(getState(), (draft: Draft<BillingState>) => {
        draft.confirmPlan.dlgSwitch = true;
      }),
    );
  },

  hideSwitchDialog: (): Action<BillingState> => ({ setState, getState }) => {
    setState(
      produce(getState(), (draft: Draft<BillingState>) => {
        draft.confirmPlan.dlgSwitch = false;
      }),
    );
  },

  showSwitchPaymentDialog: (): Action<BillingState> => ({ setState, getState }) => {
    setState(
      produce(getState(), (draft: Draft<BillingState>) => {
        draft.confirmPlan.dlgSwitchPayment = true;
      }),
    );
  },

  hideSwitchPaymentDialog: (): Action<BillingState> => ({ setState, getState }) => {
    setState(
      produce(getState(), (draft: Draft<BillingState>) => {
        draft.confirmPlan.dlgSwitchPayment = false;
      }),
    );
  },
};
