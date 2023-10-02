import { BillingService } from '@source/api/services/BillingService';
import { BillingState } from '@source/modules/billing/store/state/types/BillingState';
import { RequestStatusGenerator } from '@source/utils/RequestStatusGenerator';
import { Action } from 'react-sweet-state';
import { i18n } from '@source/i18n/i18n';
import { toast } from '@source/uikit';
import { billingContactDialogActions } from '@source/modules/billing/store/actions/billingContactDialogActions';
import { formatText } from '@source/utils/formatText';
import { billingSwitchPlanActions } from '@source/modules/billing/store/actions/billingSwitchPlanActions';

export const billingActions = {
  initAvailablePlans: (): Action<BillingState> => ({ getState, dispatch }) => {
    if (!getState().plans.list.length) dispatch(billingActions.getBillingPlans());
    dispatch(billingSwitchPlanActions.getPrecheckPlanSwitchInfo());
  },

  getBillingPlans: (): Action<BillingState> => async ({ setState, getState }) => {
    if (getState().plans.rs.inProgress) {
      return;
    }

    try {
      setState({ plans: { ...getState().plans, rs: RequestStatusGenerator.request() } });
      const res = await BillingService.getAvailableBillingPlans({ withRecommended: true });
      setState({
        plans: {
          list: res.data,
          rs: RequestStatusGenerator.success(),
        },
      });
    } catch (e) {
      setState({ plans: { ...getState().plans, rs: RequestStatusGenerator.failure() } });
    }
  },

  getContactList: (): Action<BillingState> => async ({ setState, getState }) => {
    if (getState().contact.rsLoad.inProgress) {
      return;
    }

    try {
      setState({ contact: { ...getState().contact, rsLoad: RequestStatusGenerator.request() } });
      const res = await BillingService.getBillingContacts();
      setState({
        contact: {
          ...getState().contact,
          list: res.data,
          rsLoad: RequestStatusGenerator.success(),
        },
      });
    } catch (e) {
      setState({ contact: { ...getState().contact, rsLoad: RequestStatusGenerator.failure() } });
    }
  },

  addContact: (email: string): Action<BillingState> => async ({ setState, getState, dispatch }) => {
    if (getState().contact.rsAdd.inProgress) {
      return;
    }

    try {
      setState({ contact: { ...getState().contact, rsAdd: RequestStatusGenerator.request() } });
      const res = await BillingService.addBillingContact({ email });
      setState({
        contact: {
          ...getState().contact,
          list: res.data,
          rsAdd: RequestStatusGenerator.success(),
        },
      });

      dispatch(billingContactDialogActions.hideAddContactDialog());
      toast.success(formatText('billing.toast.addContact.success', { email }));
    } catch (e) {
      setState({ contact: { ...getState().contact, rsAdd: RequestStatusGenerator.failure(e) } });
      toast.error(i18n.t('billing.toast.addContact.error'));
    }
  },

  removeContact: (email: string): Action<BillingState> => async ({ setState, getState, dispatch }) => {
    if (getState().contact.rsRemove.inProgress) {
      return;
    }

    try {
      setState({ contact: { ...getState().contact, rsRemove: RequestStatusGenerator.request() } });
      const res = await BillingService.removeBillingContact({ email });
      setState({
        contact: {
          ...getState().contact,
          list: res.data,
          rsRemove: RequestStatusGenerator.success(),
        },
      });

      dispatch(billingContactDialogActions.hideRemoveContactDialog());
      toast.success(formatText('billing.toast.removeContact.success', { email }));
    } catch (e) {
      setState({ contact: { ...getState().contact, rsRemove: RequestStatusGenerator.failure() } });
      toast.error(i18n.t('billing.toast.removeContact.error'));
    }
  },

  getCreditBalance: (): Action<BillingState> => async ({ setState, getState }) => {
    if (getState().credit.rs.inProgress) {
      return;
    }

    try {
      setState({ credit: { ...getState().credit, rs: RequestStatusGenerator.request() } });
      const res = await BillingService.getCreditBalance();
      setState({
        credit: {
          balance: res.data.creditBalance,
          rs: RequestStatusGenerator.success(),
        },
      });
    } catch (e) {
      setState({ credit: { ...getState().credit, rs: RequestStatusGenerator.failure() } });
    }
  },

  setCountries: (countries): Action<BillingState> => ({ setState }) => {
    const formattedCountries = countries.map((country) => ({
      value: country.code,
      label: country.name,
      ...country,
    }));

    setState({ countries: formattedCountries });
  },
};
