import { i18n } from '@source/i18n/i18n';
import { checkVAT, countries } from 'jsvat';
import * as yup from 'yup';

export const billingFormPaymentMethodSchema = (inSepa: boolean) => {
  return yup.object().shape({
    countryCode: yup.string().required(i18n.t('billing.formPaymentMethod.error.country')),
    companyName: yup.string().required(i18n.t('billing.formPaymentMethod.error.company')),
    addressLine1: yup.string().required(i18n.t('billing.formPaymentMethod.error.streetAddress')),
    addressLine2: yup.string(),
    city: yup.string().required(i18n.t('billing.formPaymentMethod.error.city')),
    region: yup.string(),
    postCode: yup.string(),
    vatNumber: yup.string().test('vatNumber', i18n.t('billing.formPaymentMethod.error.vat'), (value, context) => {
      if (inSepa && value) {
        return checkVAT(`${context.parent.countryCode}${value}`, countries).isValid;
      }
      return true;
    }),
  });
};
