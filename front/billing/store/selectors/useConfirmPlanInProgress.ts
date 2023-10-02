import { createHook } from 'react-sweet-state';
import { BillingStore } from '@source/modules/billing/store/BillingStore';
import { BillingState } from '@source/modules/billing/store/state/types/BillingState';

export const useConfirmPlanInProgress = createHook(BillingStore, {
  selector: (state: BillingState) => ({
    isConfirmPlanInProgress:
      state.payment.rsAdd.inProgress ||
      state.payment.rsEditBillingAddress.inProgress ||
      state.switchPlan.rs.inProgress ||
      state.payment.rsValidateCard.inProgress,
  }),
});
