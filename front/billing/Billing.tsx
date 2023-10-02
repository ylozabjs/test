import React, { useContext, useEffect, lazy, Suspense } from 'react';
import styles from './components/BillingPlans.scss';
import { i18n } from '@source/i18n/i18n';
import { PageContentLayout, Tab, Tabs } from '@source/uikit/layout';
import { billingRoutes } from '@source/modules/billing/routes/billingRoutes';
import { BillingInfo } from '@source/modules/billing/components/information/BillingInfo';
import { BillingPaymentHistory } from '@source/modules/billing/components/payment-history/BillingPaymentHistory';
import { useBillingStore } from '@source/modules/billing/store/BillingStore';
import { Route, Routes, useNavigate } from 'react-router';
import { BillingPlans } from '@source/modules/billing/components/BillingPlans';
import { BackSvg, Button } from '@source/uikit';
import { isMasterAccount } from '@source/utils/isMasterAccount';
import { ConfigContext } from '@source/contexts/ConfigProvider';
import { useAuthStore } from '@source/stores/auth/AuthStore';
import { BillingDetails } from '@source/modules/billing/components/details/BillingDetails';
import { useBillingNotifications } from '@source/hooks/notifications/useBillingNotifications';

const TestTool = lazy(() => import('@source/components/TestTools/TestTool'));

const billingsTabs: Tab[] = [
  {
    label: i18n.t('billing.tabs.overview'),
    content: <BillingInfo />,
    path: billingRoutes.infoSettings,
  },
  {
    label: i18n.t('billing.tabs.details'),
    content: <BillingDetails />,
    path: billingRoutes.details,
  },
  {
    label: i18n.t('billing.tabs.paymentHistory'),
    content: <BillingPaymentHistory />,
    path: billingRoutes.paymentHistorySettings,
  },
];

export const Billing: React.FC = () => {
  const [, actions] = useBillingStore();
  const [{ auth, rs }] = useAuthStore();
  const navigate = useNavigate();
  const [config] = useContext(ConfigContext);
  const billingManager = isMasterAccount(auth) && auth.permissions.billing.changeBillingPlan;

  const goBack = () => {
    navigate(billingRoutes.infoSettings);
  };

  useEffect(() => {
    if (auth && !auth.permissions.billing.viewBillingStatements && !isMasterAccount(auth)) {
      // TODO:  fix after transfer app on react(react-router v6 useNavigate())
      window.location.assign(`/#/account`);
    }

    if (billingManager) {
      actions.getPaymentMethods();
      actions.getCreditBalance();
      actions.getContactList();
    }
  }, [rs.success]);

  useEffect(() => {
    if (billingManager) {
      actions.setCountries(config.countries);
    }
  }, [config.countries]);

  useBillingNotifications();

  const renderHeader = () => (
    <div className={styles.billingPlansHeader}>
      <Button variant="icon" onClick={goBack}>
        <BackSvg />
      </Button>
      <div className={styles.billingPlansHeaderBackBtnTitle}>{i18n.t('billing.plans.btnBack')}</div>
    </div>
  );

  return (
    <>
      <Routes>
        <Route
          path={billingRoutes.plans}
          element={
            <PageContentLayout title={renderHeader()}>
              <BillingPlans />
            </PageContentLayout>
          }
        />
        <Route
          path={billingRoutes.root}
          element={
            <PageContentLayout title={i18n.t('billing.title')}>
              <Tabs tabs={billingsTabs} />
            </PageContentLayout>
          }
        />
      </Routes>

      {process.env.TEST_TOOLS && (
        <Suspense fallback={<div>Loading...</div>}>
          <TestTool
            modulePath="/dev/billing"
            requests={{
              precheckPlanSwitch: () => {
                actions.getPrecheckPlanSwitchInfo();
                actions.resetDeclineReasons();
              },
              creditBalance: actions.getCreditBalance,
            }}
          />
        </Suspense>
      )}
    </>
  );
};
