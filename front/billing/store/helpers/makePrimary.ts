import { produce, Draft } from 'immer';
import { GetState, SetState } from 'react-sweet-state';
import { BillingService } from '@source/api/services/BillingService';
import { BillingState } from '@source/modules/billing/store/state/types/BillingState';
import { updatePrimaryPaymentMethod } from '@source/modules/billing/store/helpers/updatePrimaryPaymentMethod';
import { sortPaymentMethods } from '@source/modules/billing/store/helpers/sortPaymentMethods';

interface MakePrimary {
  getState: GetState<BillingState>;
  setState: SetState<BillingState>;
  token: string;
}

export const makePrimary = async ({ getState, setState, token }: MakePrimary) => {
  await BillingService.makePrimaryMethod({ token });
  const changedMethods = updatePrimaryPaymentMethod(getState().paymentMethods.list, token);

  setState(
    produce(getState(), (draft: Draft<BillingState>) => {
      draft.paymentMethods.list = sortPaymentMethods(changedMethods);
    }),
  );
};
