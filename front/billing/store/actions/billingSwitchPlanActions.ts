import { isEmpty } from 'lodash';
import { defaultRegistry } from 'react-sweet-state';
import { produce, Draft } from 'immer';
import { toast } from '@source/uikit';
import { i18n } from '@source/i18n/i18n';
import { BillingService } from '@source/api/services/BillingService';
import { RequestStatusGenerator } from '@source/utils/RequestStatusGenerator';
import { Action } from 'react-sweet-state';
import { BillingState } from '@source/modules/billing/store/state/types/BillingState';
import { countryCodes } from '@source/modules/billing/helpers/countryCodes';
import { BillingPeriod } from '@source/modules/billing/types/BillingPeriod';
import { defaultBillingPeriod } from '@source/defaults/defaultBillingPeriod';
import { switchPlan } from '@source/modules/billing/store/helpers/switchPlan';
import { setDeclineReasons } from '@source/modules/billing/store/helpers/setDeclineReasons';
import { billingSwitchPlanDialogActions } from '@source/modules/billing/store/actions/billingSwitchPlanDialogActions';
import { AuthStore } from '@source/stores/auth/AuthStore';
import { IAvailableBillingPlan } from '@source/types/common/IAvailableBillingPlan';
import { BillingPlanStore } from '@source/stores/billing-plan/BillingPlanStore';

const authStore = defaultRegistry.getStore(AuthStore);
const planStore = defaultRegistry.getStore(BillingPlanStore);

export const billingSwitchPlanActions = {
  getPrecheckPlanSwitchInfo: (): Action<BillingState> => async ({ getState, setState }) => {
    if (getState().precheckPlanSwitch.rs.inProgress) {
      return;
    }

    try {
      setState({ precheckPlanSwitch: { ...getState().precheckPlanSwitch, rs: RequestStatusGenerator.request() } });
      const res = await BillingService.getPrecheckPlanSwitchInfo();

      setState({
        precheckPlanSwitch: {
          ...getState().precheckPlanSwitch,
          info: res.data.info,
          rs: RequestStatusGenerator.success(),
        },
      });
    } catch (err) {
      setState({
        precheckPlanSwitch: { ...getState().precheckPlanSwitch, rs: RequestStatusGenerator.failure() },
      });
      toast.error(err.response?.data?.message || i18n.t('billing.toast.defaultError'));
    }
  },

  precheckPlanSwitch: (): Action<BillingState> => async ({ getState, setState, dispatch }) => {
    const {
      switchPlan,
      precheckPlanSwitch,
      confirmPlan: { plan },
      paymentMethods: { list },
      payment,
    } = getState();

    const {
      auth: { account },
    } = authStore.storeState.getState();

    const { accountBillingLocked } = switchPlan?.declineReasons ?? precheckPlanSwitch.info;
    const usersCount = switchPlan?.declineReasons?.userLimit?.usersCount ?? precheckPlanSwitch.info.users;
    const storageUsed = switchPlan?.declineReasons?.storageLimit?.used ?? precheckPlanSwitch.info.storage.used;
    const storageExtra = precheckPlanSwitch.info.storage.extra;
    const isUserLimit = usersCount > plan.users && plan.users !== 0;
    const isStorageLimit = storageUsed > plan.storage + storageExtra;
    const primaryCardExpired = list.find((c) => c.default)?.expired;
    const isAccountHasActiveCard = !isEmpty(list) && list.some((c) => !c.expired);
    const cardWasAddedWhenSwitch = payment.rsAdd.success && switchPlan.rs.success;
    const isShouldChangeCard = isAccountHasActiveCard && !!primaryCardExpired && !cardWasAddedWhenSwitch;

    if (isUserLimit || isStorageLimit || accountBillingLocked || isShouldChangeCard) {
      setState(
        produce(getState(), (draft: Draft<BillingState>) => {
          draft.switchPlan.declineReasons = {
            ...(accountBillingLocked && { accountBillingLocked: true }),
            ...(isUserLimit && {
              userLimit: { usersCount, usersByPlan: plan.users },
            }),
            ...(isStorageLimit && {
              storageLimit: { spaceCleared: storageUsed - (plan.storage + storageExtra), used: storageUsed },
            }),
            ...(isShouldChangeCard && { primaryCardExpired }),
          };
        }),
      );
      dispatch(billingSwitchPlanDialogActions.showSwitchAlertDialog());
    } else {
      if (!isAccountHasActiveCard || (isEmpty(account?.billingAddress) && !account?.manualPayments)) {
        dispatch(billingSwitchPlanDialogActions.showSwitchPaymentDialog());
      } else {
        dispatch(billingSwitchPlanDialogActions.showSwitchDialog());
      }
    }
  },

  switchPlan: (): Action<BillingState> => async ({ getState, setState, dispatch }) => {
    if (getState().switchPlan.rs.inProgress) {
      return;
    }

    try {
      setState(
        produce(getState(), (draft: Draft<BillingState>) => {
          draft.switchPlan.rs = RequestStatusGenerator.request();
        }),
      );
      const plan = { id: getState().confirmPlan.plan.id, period: getState().confirmPlan.period };

      await switchPlan({
        getState,
        setState,
        plan,
      });
      setState(
        produce(getState(), (draft: Draft<BillingState>) => {
          draft.switchPlan.rs = RequestStatusGenerator.success();
        }),
      );
      dispatch(billingSwitchPlanDialogActions.hideSwitchDialog());
      dispatch(billingSwitchPlanDialogActions.showCongratulationDialog());
    } catch (err) {
      setState(
        produce(getState(), (draft: Draft<BillingState>) => {
          draft.switchPlan.rs = RequestStatusGenerator.failure();
        }),
      );
      if (err?.declineReasons) {
        setDeclineReasons({ getState, setState, dispatch, declineReasons: err.declineReasons });
      } else {
        toast.error(err.response?.data?.message || i18n.t('billing.toast.defaultError'));
      }
    }
  },

  switchPlanPayment: (): Action<BillingState> => async ({ getState, setState, dispatch }) => {
    if (getState().switchPlan.rs.inProgress) {
      return;
    }

    try {
      setState(
        produce(getState(), (draft: Draft<BillingState>) => {
          draft.switchPlan.rs = RequestStatusGenerator.request();
        }),
      );
      const plan = { id: getState().confirmPlan.plan.id, period: getState().confirmPlan.period };

      await switchPlan({
        getState,
        setState,
        plan,
      });
      setState(
        produce(getState(), (draft: Draft<BillingState>) => {
          draft.switchPlan.rs = RequestStatusGenerator.success();
        }),
      );
      dispatch(billingSwitchPlanDialogActions.hideSwitchPaymentDialog());
      dispatch(billingSwitchPlanDialogActions.showCongratulationDialog());
    } catch (err) {
      setState(
        produce(getState(), (draft: Draft<BillingState>) => {
          draft.switchPlan.rs = RequestStatusGenerator.failure();
        }),
      );
      if (err?.declineReasons) {
        setDeclineReasons({ getState, setState, dispatch, declineReasons: err.declineReasons });
      } else {
        toast.error(err.response?.data?.message || i18n.t('billing.toast.defaultError'));
        dispatch(billingSwitchPlanDialogActions.hideSwitchPaymentDialog());
        dispatch(billingSwitchPlanDialogActions.showSwitchDialog());
      }
    }
  },

  resetConfirmPlan: (): Action<BillingState> => ({ setState, getState }) => {
    setState({
      confirmPlan: {
        ...getState().confirmPlan,
        plan: {
          id: '',
          name: '',
          price: {
            month: 0,
            year: 0,
          },
          users: 0,
          storage: 0,
          burstableStorage: 0,
          isPaid: false,
        },
      },
    });
  },

  resetDeclineReasons: (): Action<BillingState> => ({ setState }) => {
    setState({
      switchPlan: { rs: RequestStatusGenerator.init() },
    });
  },

  setConfirmPlan: (plan: IAvailableBillingPlan): Action<BillingState> => ({ setState, getState }) => {
    const { name, id, storage, users } = plan;

    setState({
      confirmPlan: {
        ...getState().confirmPlan,
        plan: {
          name,
          id,
          storage,
          users,
          burstableStorage: plan.dataTransferLimit,
          price: { month: plan.price.month, year: plan.price.year },
          isPaid: plan.price.month > 0,
        },
      },
    });
  },

  setPeriod: (period: string): Action<BillingState> => ({ setState, getState }) => {
    setState({ confirmPlan: { ...getState().confirmPlan, period } });
  },

  resetPeriod: (): Action<BillingState> => ({ setState, getState }) => {
    const {
      confirmPlan,
      paymentMethods: { list },
    } = getState();

    if (!isEmpty(list) && list.some((pM) => pM?.manualPayment)) {
      setState({ confirmPlan: { ...confirmPlan, period: BillingPeriod.year } });
    } else {
      setState({ confirmPlan: { ...confirmPlan, period: defaultBillingPeriod } });
    }
  },

  setVat: (countryCode: string): Action<BillingState> => ({ setState, getState }) => {
    setState({
      confirmPlan: {
        ...getState().confirmPlan,
        vat: countryCodes.getCountry(getState().countries, countryCode).vat || 0,
      },
    });
  },

  changeBillingPlanPeriod: (plan: IAvailableBillingPlan): Action<BillingState> => ({ getState, dispatch }) => {
    const { period } = planStore.storeState.getState().info;

    dispatch(billingSwitchPlanActions.setConfirmPlan(plan));
    dispatch(
      billingSwitchPlanActions.setPeriod(period === BillingPeriod.month ? BillingPeriod.year : BillingPeriod.month),
    );
    dispatch(billingSwitchPlanActions.precheckPlanSwitch());
  },

  selectBillingPlan: (plan: IAvailableBillingPlan): Action<BillingState> => ({ dispatch }) => {
    dispatch(billingSwitchPlanActions.setConfirmPlan(plan));
    dispatch(billingSwitchPlanActions.precheckPlanSwitch());
  },
};
