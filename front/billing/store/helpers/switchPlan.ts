import { isEmpty } from 'lodash';
import { GetState, SetState, defaultRegistry } from 'react-sweet-state';
import { BillingService } from '@source/api/services/BillingService';
import { BillingState } from '@source/modules/billing/store/state/types/BillingState';
import { BillingPlanStore } from '@source/stores/billing-plan/BillingPlanStore';

interface SwitchPlan {
  getState: GetState<BillingState>;
  setState: SetState<BillingState>;
  plan: {
    id: string;
    period: string;
  };
}

const planStore = defaultRegistry.getStore(BillingPlanStore);

export const switchPlan = async ({ plan }: SwitchPlan) => {
  const res = await BillingService.switchBillingPlan({
    planInfo: {
      id: plan.id,
      billingPeriod: plan.period,
    },
  });

  if (!isEmpty(res.data?.declineReasons)) {
    throw res.data;
  }

  planStore.actions.updatePlan(res.data);
};
