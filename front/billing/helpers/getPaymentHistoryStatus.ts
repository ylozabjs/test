import moment from 'moment';
import { dateFormat } from '@source/constants/formats';
import { BillingInvoice } from '@source/api/dto/responses/billing/BillingHistoryResDto';
import { PaymentHistoryStatusProps } from '@source/modules/billing/components/payment-history/PaymentHistoryStatus';

export const getPaymentHistoryStatus = (invoice: BillingInvoice): PaymentHistoryStatusProps => {
  const getData = (data) => moment.utc(data).format(dateFormat.moment);

  if (invoice.paid) {
    return { status: 'paid', changeDate: getData(invoice.lastAttempt.createdAt) };
  }
  if (invoice.canceled) {
    return { status: 'canceled', changeDate: getData(invoice.canceled) };
  }
  if (invoice.lastAttempt && !invoice.lastAttempt.paid) {
    return { status: 'failed', changeDate: getData(invoice.lastAttempt.createdAt) };
  }
  return {
    status: 'pending',
    changeDate: null,
  };
};
