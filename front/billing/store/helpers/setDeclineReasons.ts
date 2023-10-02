import { produce, Draft } from 'immer';
import { GetState, SetState } from 'react-sweet-state';
import { BillingState } from '@source/modules/billing/store/state/types/BillingState';
import { billingSwitchPlanDialogActions } from '@source/modules/billing/store/actions/billingSwitchPlanDialogActions';
import { DispatchAnyAction } from '@source/types/common/DispatchAnyAction';
import { DeclineReasons } from '@source/modules/billing/types/DeclineReasons';

interface SetDeclineReasons {
  getState: GetState<BillingState>;
  setState: SetState<BillingState>;
  dispatch: DispatchAnyAction;
  declineReasons: DeclineReasons;
}

export const setDeclineReasons = async ({ getState, setState, dispatch, declineReasons }: SetDeclineReasons) => {
  setState(
    produce(getState(), (draft: Draft<BillingState>) => {
      draft.switchPlan.declineReasons = declineReasons;
    }),
  );
  if (getState().confirmPlan.dlgSwitch) {
    dispatch(billingSwitchPlanDialogActions.hideSwitchDialog());
  } else {
    dispatch(billingSwitchPlanDialogActions.hideSwitchPaymentDialog());
  }
  dispatch(billingSwitchPlanDialogActions.showSwitchAlertDialog());
};
