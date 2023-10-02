import { BillingSwitchPlan } from '@source/modules/billing/types/BillingSwitchPlan';

export interface ConfirmBillingPlan extends BillingSwitchPlan {
  name: string;
  id: string;
  isPaid: boolean;
}
