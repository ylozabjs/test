import { RequestStatusGenerator } from '@source/utils/RequestStatusGenerator';
import { defaultBillingPeriod } from '@source/defaults/defaultBillingPeriod';

export const billingInitialState = {
  plans: {
    list: [],
    rs: RequestStatusGenerator.init(),
  },
  paymentMethods: {
    list: [],
    selected: null,
    error: '',
    dlgRemove: false,
    dlgMakePrimary: false,
    dlgAlert: false,
    rsLoad: RequestStatusGenerator.init(),
    rsMakePrimary: RequestStatusGenerator.init(),
    rsCheck: RequestStatusGenerator.init(),
    rsRemove: RequestStatusGenerator.init(),
  },
  history: {
    dlgInvoicePayment: false,
    data: null,
    rs: RequestStatusGenerator.init(),
  },
  contact: {
    list: [],
    selected: '',
    dlgAdd: false,
    dlgRemove: false,
    rsLoad: RequestStatusGenerator.init(),
    rsAdd: RequestStatusGenerator.init(),
    rsRemove: RequestStatusGenerator.init(),
  },
  credit: {
    balance: 0,
    rs: RequestStatusGenerator.init(),
  },
  payment: {
    countryCode: '',
    dlgAdd: false,
    dlgEdit: false,
    rsAdd: RequestStatusGenerator.init(),
    rsEditBillingAddress: RequestStatusGenerator.init(),
    selected: null,
    rsToken: RequestStatusGenerator.init(),
    token: null,
    rsMntBraintree: RequestStatusGenerator.init(),
    rsValidateCard: RequestStatusGenerator.init(),
    rsEdit: RequestStatusGenerator.init(),
    invalidFields: {},
    isValidateCard: false,
  },
  confirmPlan: {
    dlgSwitchPayment: false,
    dlgSwitch: false,
    dlgCongrat: false,
    dlgAlert: false,
    period: defaultBillingPeriod,
    vat: 0,
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
  precheckPlanSwitch: {
    info: {
      storage: {
        used: 0,
        extra: 0,
      },
      users: 0,
      accountBillingLocked: false,
    },
    rs: RequestStatusGenerator.init(),
  },
  switchPlan: {
    rs: RequestStatusGenerator.init(),
  },
  billingInfo: {
    dlgSave: false,
  },
  countries: [],
};
