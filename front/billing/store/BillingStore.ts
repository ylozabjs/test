import { billingPaymentHistoryActions } from './actions/billingPaymentHistoryActions';
import { billingActions } from '@source/modules/billing/store/actions/billingActions';
import { billingContactDialogActions } from '@source/modules/billing/store/actions/billingContactDialogActions';
import { billingSwitchPlanActions } from '@source/modules/billing/store/actions/billingSwitchPlanActions';
import { billingInitialState } from '@source/modules/billing/store/state/billingInitialState';
import { createHook, createStore } from 'react-sweet-state';
import { BillingState } from '@source/modules/billing/store/state/types/BillingState';
import { billingPaymentMethodsDialogActions } from '@source/modules/billing/store/actions/billingPaymentMethodsDialogActions';
import { billingValidateCardActions } from '@source/modules/billing/store/actions/billingValidateCardActions';
import { billingPaymentMethodActions } from '@source/modules/billing/store/actions/billingPaymentMethodActions';
import { billingSwitchPlanDialogActions } from '@source/modules/billing/store/actions/billingSwitchPlanDialogActions';
import { billingNotificationActions } from '@source/modules/billing/store/actions/billingNotificationActions';

type Actions = typeof actions;

const actions = {
  ...billingActions,
  ...billingPaymentHistoryActions,
  ...billingContactDialogActions,
  ...billingValidateCardActions,
  ...billingSwitchPlanActions,
  ...billingSwitchPlanDialogActions,
  ...billingPaymentMethodsDialogActions,
  ...billingPaymentMethodActions,
  ...billingNotificationActions,
};

export const BillingStore = createStore<BillingState, Actions>({ initialState: billingInitialState, actions });

export const useBillingStore = createHook(BillingStore);
