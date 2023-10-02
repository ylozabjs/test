import * as yup from 'yup';
import { i18n } from '@source/i18n/i18n';
import { EMAIL_REGEXP } from '@source/constants/email-regexp';

const matchEmail = i18n.t('errorMessages.validEmail');

export const addBillingContactSchema = (emailList: string[]) => {
  return yup.object().shape({
    email: yup
      .string()
      .label(i18n.t('settings.personal.personalInformationSettings.email').toLocaleLowerCase())
      .test('email', i18n.t('billing.error.contactExists'), (value) => {
        return !emailList.find((mail) => mail === value);
      })
      .matches(EMAIL_REGEXP, matchEmail)
      .required(matchEmail),
  });
};
