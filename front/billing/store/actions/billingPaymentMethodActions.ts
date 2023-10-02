import { produce, Draft } from 'immer';
import { isEmpty } from 'lodash';
import { BillingService } from '@source/api/services/BillingService';
import { i18n } from '@source/i18n/i18n';
import { BillingState } from '@source/modules/billing/store/state/types/BillingState';
import { toast } from '@source/uikit';
import { RequestStatusGenerator } from '@source/utils/RequestStatusGenerator';
import { stickyToast } from '@source/utils/stickyToast';
import { Action, defaultRegistry } from 'react-sweet-state';
import { billingSwitchPlanActions } from '@source/modules/billing/store/actions/billingSwitchPlanActions';
import { PaymentMethodBraintree } from '@source/types/common/PaymentMethodBraintree';
import { sortPaymentMethods } from '@source/modules/billing/store/helpers/sortPaymentMethods';
import { billingPaymentMethodsDialogActions } from '@source/modules/billing/store/actions/billingPaymentMethodsDialogActions';
import { makePrimary } from '@source/modules/billing/store/helpers/makePrimary';
import { AuthStore } from '@source/stores/auth/AuthStore';
import { BillingAddress } from '@source/api/dto/common/BillingAddress';
import { RequestStatus } from '@source/types/common/RequestStatus';
import { IPaymentMethod } from '@source/types/common/IPaymentMethod';
import { updatePaymentMethods } from '@source/modules/billing/store/helpers/updatePaymentMethods';

const authStore = defaultRegistry.getStore(AuthStore);

export const billingPaymentMethodActions = {
  addPaymentMethod: (data: PaymentMethodBraintree): Action<BillingState> => async ({
    setState,
    getState,
    dispatch,
  }) => {
    if (getState().payment.rsAdd.inProgress) {
      return;
    }

    try {
      setState({ payment: { ...getState().payment, rsAdd: RequestStatusGenerator.request() } });
      const res = await BillingService.addPaymentMethod(data);
      if (res.data.default) {
        authStore.actions.updateBillingAddress(data.billingAddress);
      }

      setState({
        paymentMethods: {
          ...getState().paymentMethods,
          list: [...getState().paymentMethods.list, res.data],
        },
        payment: { ...getState().payment, rsAdd: RequestStatusGenerator.success() },
      });
      dispatch(billingPaymentMethodsDialogActions.hideAddPaymentMethodDialog());
      toast.success(i18n.t('billing.toast.addPaymentMethod.success'));
    } catch (e) {
      setState({ payment: { ...getState().payment, rsAdd: RequestStatusGenerator.failure() } });
      toast.error(i18n.t('billing.toast.addPaymentMethod.error'));
    }
  },

  addPaymentMethodWithSwitch: (data: PaymentMethodBraintree): Action<BillingState> => async ({
    setState,
    getState,
    dispatch,
  }) => {
    if (getState().payment.rsAdd.inProgress) {
      return;
    }

    const { manualPayments } = authStore.storeState.getState().auth.account;

    try {
      if (manualPayments) {
        setState(
          produce(getState(), (draft: Draft<BillingState>) => {
            draft.payment.rsEditBillingAddress = RequestStatusGenerator.request();
          }),
        );
        await BillingService.editBillingAddress(data.billingAddress);
        setState(
          produce(getState(), (draft: Draft<BillingState>) => {
            draft.payment.rsEditBillingAddress = RequestStatusGenerator.success();
          }),
        );
      } else {
        const oldPaymentList = getState().paymentMethods.list;
        setState(
          produce(getState(), (draft: Draft<BillingState>) => {
            draft.payment.rsAdd = RequestStatusGenerator.request();
          }),
        );
        const resAdd = await BillingService.addPaymentMethod(data);
        setState(
          produce(getState(), (draft: Draft<BillingState>) => {
            draft.payment.rsAdd = RequestStatusGenerator.success();
            draft.paymentMethods.list = [...getState().paymentMethods.list, resAdd.data];
          }),
        );

        if (!!oldPaymentList.find((c) => c.default && c.expired) && oldPaymentList.every((c) => c.expired)) {
          setState(
            produce(getState(), (draft: Draft<BillingState>) => {
              draft.paymentMethods.selected = resAdd.data;
            }),
          );
          dispatch(billingPaymentMethodActions.makePrimaryMethod(resAdd.data.token));
        }

        if (isEmpty(authStore.storeState.getState().auth.account.billingAddress)) {
          authStore.actions.updateBillingAddress(resAdd.data.billingAddress);
        }
      }

      dispatch(billingSwitchPlanActions.switchPlanPayment());
    } catch (err) {
      if (!manualPayments) {
        setState(
          produce(getState(), (draft: Draft<BillingState>) => {
            draft.payment.rsAdd = RequestStatusGenerator.failure();
          }),
        );
      } else {
        setState(
          produce(getState(), (draft: Draft<BillingState>) => {
            draft.payment.rsEditBillingAddress = RequestStatusGenerator.failure();
          }),
        );
      }
      toast.error(i18n.t('billing.toast.addPaymentMethod.error'));
    }
  },

  setCountryCode: (code: string): Action<BillingState> => ({ getState, setState }) => {
    setState({ payment: { ...getState().payment, countryCode: code } });
  },

  editPaymentMethod: (data: PaymentMethodBraintree): Action<BillingState> => async ({
    setState,
    getState,
    dispatch,
  }) => {
    if (getState().payment.rsEdit.inProgress) {
      return;
    }

    try {
      setState({ payment: { ...getState().payment, rsEdit: RequestStatusGenerator.request() } });
      const token = getState().payment.selected.token;
      const res = await BillingService.editPaymentMethod({ ...data, token });

      setState({
        paymentMethods: {
          ...getState().paymentMethods,
          list: updatePaymentMethods(getState().paymentMethods.list, res.data),
        },
        payment: { ...getState().payment, rsEdit: RequestStatusGenerator.success() },
      });
      dispatch(billingPaymentMethodsDialogActions.hideEditPaymentMethodDialog());
      toast.success(i18n.t('billing.toast.editPaymentMethod.success'));
    } catch (e) {
      setState({ payment: { ...getState().payment, rsEdit: RequestStatusGenerator.failure(e.message) } });
      stickyToast(e.response?.data?.message || i18n.t('billing.toast.editPaymentMethod.error'));
    }
  },

  getToken: (): Action<BillingState> => async ({ setState, getState }) => {
    if (getState().payment.rsToken.inProgress) {
      return;
    }

    try {
      setState({
        payment: {
          ...getState().payment,
          rsToken: RequestStatusGenerator.request(),
          rsMntBraintree: RequestStatusGenerator.request(),
        },
      });
      const res = await BillingService.getBraintreeToken();

      setState({
        payment: { ...getState().payment, rsToken: RequestStatusGenerator.success(), token: res.data.clientToken },
      });
    } catch (e) {
      setState({
        payment: {
          ...getState().payment,
          rsToken: RequestStatusGenerator.failure(e.message),
          rsMntBraintree: RequestStatusGenerator.failure(),
        },
      });
    }
  },

  saveBillingAddress: (billingAddress: BillingAddress): Action<BillingState> => async ({
    setState,
    getState,
    dispatch,
  }) => {
    if (getState().payment.rsEditBillingAddress.inProgress) {
      return;
    }

    try {
      setState({ payment: { ...getState().payment, rsEditBillingAddress: RequestStatusGenerator.request() } });
      await BillingService.editBillingAddress(billingAddress);
      setState(
        produce(getState(), (draft: Draft<BillingState>) => {
          draft.payment.rsEditBillingAddress = RequestStatusGenerator.success();
        }),
      );
      authStore.actions.updateBillingAddress(billingAddress);
      dispatch(billingPaymentMethodsDialogActions.hideSaveBillingInfoDialog());
      toast.success(i18n.t('billing.toast.editBillingAddress.success'));
    } catch (e) {
      setState({ payment: { ...getState().payment, rsEditBillingAddress: RequestStatusGenerator.failure(e.message) } });
      toast.error(i18n.t('billing.toast.editBillingAddress.error'));
    }
  },

  resetPaymentState: (): Action<BillingState> => async ({ setState, getState }) => {
    setState({
      payment: {
        ...getState().payment,
        token: '',
        countryCode: '',
        rsToken: RequestStatusGenerator.init(),
        rsMntBraintree: RequestStatusGenerator.init(),
      },
    });
  },

  setRsMntBraintree: (rsMntBraintree: RequestStatus): Action<BillingState> => async ({ setState, getState }) => {
    setState({ payment: { ...getState().payment, rsMntBraintree } });
  },

  setRsValidateCard: (rsValidateCard: RequestStatus): Action<BillingState> => async ({ setState, getState }) => {
    setState({ payment: { ...getState().payment, rsValidateCard } });
  },

  getPaymentMethods: (): Action<BillingState> => async ({ setState, getState }) => {
    if (getState().paymentMethods.rsLoad.inProgress) {
      return;
    }

    try {
      setState({ paymentMethods: { ...getState().paymentMethods, rsLoad: RequestStatusGenerator.request() } });
      const res = await BillingService.getPaymentMethods();
      const sortedPaymentMethods = sortPaymentMethods(res.data);

      setState({
        paymentMethods: {
          ...getState().paymentMethods,
          list: sortedPaymentMethods || [],
          rsLoad: RequestStatusGenerator.success(),
        },
      });
    } catch (e) {
      setState({ paymentMethods: { ...getState().paymentMethods, rsLoad: RequestStatusGenerator.failure(e.message) } });
    }
  },

  makePrimaryMethod: (token: string): Action<BillingState> => async ({ setState, getState }) => {
    if (getState().paymentMethods.rsMakePrimary.inProgress) {
      return;
    }

    try {
      setState(
        produce(getState(), (draft: Draft<BillingState>) => {
          draft.paymentMethods.rsMakePrimary = RequestStatusGenerator.request();
        }),
      );
      await makePrimary({ getState, setState, token });
      setState(
        produce(getState(), (draft: Draft<BillingState>) => {
          draft.paymentMethods.rsMakePrimary = RequestStatusGenerator.success();
        }),
      );
    } catch (e) {
      setState(
        produce(getState(), (draft: Draft<BillingState>) => {
          draft.paymentMethods.rsMakePrimary = RequestStatusGenerator.failure();
        }),
      );
    }
  },

  makePrimaryMethodWithToast: (token: string): Action<BillingState> => async ({ setState, getState, dispatch }) => {
    if (getState().paymentMethods.rsMakePrimary.inProgress) {
      return;
    }

    try {
      setState(
        produce(getState(), (draft: Draft<BillingState>) => {
          draft.paymentMethods.rsMakePrimary = RequestStatusGenerator.request();
        }),
      );
      await makePrimary({ getState, setState, token });
      setState(
        produce(getState(), (draft: Draft<BillingState>) => {
          draft.paymentMethods.rsMakePrimary = RequestStatusGenerator.success();
        }),
      );
      dispatch(billingPaymentMethodsDialogActions.hideMakePrimaryMethodDialog());
      toast.success(i18n.t('billing.toast.makePrimary.success'));
    } catch (e) {
      setState(
        produce(getState(), (draft: Draft<BillingState>) => {
          draft.paymentMethods.rsMakePrimary = RequestStatusGenerator.failure();
        }),
      );
      toast.error(i18n.t('billing.toast.makePrimary.error'));
    }
  },

  canRemovePaymentMethod: (token: string, item: IPaymentMethod): Action<BillingState> => async ({
    setState,
    getState,
    dispatch,
  }) => {
    if (getState().paymentMethods.rsCheck.inProgress) {
      return;
    }

    try {
      setState({ paymentMethods: { ...getState().paymentMethods, rsCheck: RequestStatusGenerator.request() } });
      const res = await BillingService.canRemovePaymentMethod({ token });

      setState({
        paymentMethods: {
          ...getState().paymentMethods,
          error: res.data.valid ? '' : res.data.message,
          rsCheck: RequestStatusGenerator.success(),
        },
      });

      if (res.data.valid) {
        dispatch(billingPaymentMethodsDialogActions.showRemovePaymentMethodDialog(item));
      } else {
        dispatch(billingPaymentMethodsDialogActions.showAlertDialog());
      }
    } catch (e) {
      setState({
        paymentMethods: { ...getState().paymentMethods, rsCheck: RequestStatusGenerator.failure(e.message) },
      });

      toast.error(e.response?.data?.message || i18n.t('billing.toast.defaultError'));
    }
  },

  removePaymentMethod: (token: string): Action<BillingState> => async ({ setState, getState, dispatch }) => {
    if (getState().paymentMethods.rsRemove.inProgress) {
      return;
    }

    try {
      setState({ paymentMethods: { ...getState().paymentMethods, rsRemove: RequestStatusGenerator.request() } });
      const res = await BillingService.removePaymentMethod({ token });

      if (!res.data.valid) {
        setState({
          paymentMethods: {
            ...getState().paymentMethods,
            list: getState().paymentMethods.list,
            rsRemove: RequestStatusGenerator.failure(res.data.message),
          },
        });

        toast.error(res.data.message);
        return;
      }

      const sortedPaymentMethods = sortPaymentMethods(res.data.list);

      setState({
        paymentMethods: {
          ...getState().paymentMethods,
          list: sortedPaymentMethods || getState().paymentMethods.list,
          rsRemove: RequestStatusGenerator.success(),
        },
      });

      dispatch(billingPaymentMethodsDialogActions.hideRemovePaymentMethodDialog());
      toast.success(i18n.t('billing.toast.removeMethod.success'));
    } catch (e) {
      setState({ paymentMethods: { ...getState().paymentMethods, rsRemove: RequestStatusGenerator.failure() } });
      toast.error(i18n.t('billing.toast.removeMethod.error'));
    }
  },
};
