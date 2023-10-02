import React, { useContext, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ConfigContext } from '@source/contexts/ConfigProvider';
import { useConfigState } from '@source/hooks/config/useConfigState';
import { RequestState } from '@source/types/enums/RequestState';
import { Loader } from '@source/components/base/Loader';
import { Billing } from '@source/modules/billing/Billing';
import { RouteList } from '@source/routes/route-list';
import { useAuthStore } from '@source/stores/auth/AuthStore';
import { useBillingPlanStore } from '@source/stores/billing-plan/BillingPlanStore';
import { useAppNotifications } from '@source/hooks/notifications/useAppNotifications';

export const AngularBilling: React.FC = () => {
  const [authState, authActions] = useAuthStore();
  const [planState, planActions] = useBillingPlanStore();
  const [config, setConfig] = useContext(ConfigContext);

  useConfigState({ config, setConfig });
  useAppNotifications();

  const initConfigRequest = () => {
    setConfig({ ...config, requestStatus: { state: RequestState.init } });
  };

  useEffect(() => {
    initConfigRequest();
  }, []);

  useEffect(() => {
    if (!authState.rs.success) authActions.load();
    if (!planState.rs.success && authState.rs.success) planActions.load();
  }, [planState.rs.success, authState.rs.success]);

  return (
    <Loader
      inProgress={config.requestStatus.state !== RequestState.success || !authState.rs.success || !planState.rs.success}
    >
      <Routes>
        <Route path={RouteList.accountBillingRoot} element={<Billing />} />
      </Routes>
    </Loader>
  );
};
