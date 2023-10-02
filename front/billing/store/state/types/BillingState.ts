import { RequestStatus } from '@source/types/common/RequestStatus';
import { BillingHistoryResDto } from '@source/api/dto/responses/billing/BillingHistoryResDto';
import { ConfirmBillingPlan } from '@source/modules/billing/types/ConfirmBillingPlan';
import { Country } from '@source/types/common/Country';
import { DeclineReasons } from '@source/modules/billing/types/DeclineReasons';
import { PrecheckPlanSwitchInfo } from '@source/modules/billing/types/PrecheckPlanSwitchInfo';
import { IAvailableBillingPlan } from '@source/types/common/IAvailableBillingPlan';
import { IPaymentMethod } from '@source/types/common/IPaymentMethod';

export interface BillingState {
  plans: {
    list: IAvailableBillingPlan[];
    rs: RequestStatus;
  };
  history: {
    dlgInvoicePayment: boolean;
    data: BillingHistoryResDto;
    rs: RequestStatus;
  };
  paymentMethods: {
    list: IPaymentMethod[];
    selected: IPaymentMethod;
    error: string;
    dlgRemove: boolean;
    dlgMakePrimary: boolean;
    dlgAlert: boolean;
    rsLoad: RequestStatus;
    rsMakePrimary: RequestStatus;
    rsCheck: RequestStatus;
    rsRemove: RequestStatus;
  };
  contact: {
    list: string[];
    selected: string;
    dlgAdd: boolean;
    dlgRemove: boolean;
    rsLoad: RequestStatus;
    rsAdd: RequestStatus;
    rsRemove: RequestStatus;
  };
  credit: {
    balance: number;
    rs: RequestStatus;
  };
  payment: {
    countryCode: string;
    dlgAdd: boolean;
    dlgEdit: boolean;
    selected: IPaymentMethod;
    rsAdd: RequestStatus;
    rsEditBillingAddress: RequestStatus;
    rsMntBraintree: RequestStatus;
    rsEdit: RequestStatus;
    rsValidateCard: RequestStatus;
    rsToken: RequestStatus;
    token: string;
    isValidateCard: boolean;
    invalidFields: { [key: string]: boolean };
  };
  confirmPlan: {
    dlgSwitchPayment: boolean;
    dlgSwitch: boolean;
    dlgCongrat: boolean;
    dlgAlert: boolean;
    vat: number;
    period: string;
    plan: ConfirmBillingPlan;
  };
  precheckPlanSwitch: {
    info: PrecheckPlanSwitchInfo;
    rs: RequestStatus;
  };
  switchPlan: {
    declineReasons?: DeclineReasons;
    rs: RequestStatus;
  };
  billingInfo: {
    dlgSave: boolean;
  };
  countries: Country[];
}
