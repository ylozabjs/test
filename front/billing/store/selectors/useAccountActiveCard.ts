import { createHook } from 'react-sweet-state';
import { BillingStore } from '@source/modules/billing/store/BillingStore';
import { BillingState } from '@source/modules/billing/store/state/types/BillingState';

export const useAccountActiveCard = createHook(BillingStore, {
  selector: (state: BillingState) => ({
    activeCard: state.paymentMethods.list.find((c) => (c.default && !c.expired) || !c.expired),
  }),
});
