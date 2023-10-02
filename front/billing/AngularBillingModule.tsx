import React, { useEffect } from 'react';
import { ConfigProvider } from '@source/contexts/ConfigProvider';
import { HashRouter } from 'react-router-dom';
import { ToastRoot, toast } from '@source/uikit';
import { AngularBilling } from '@source/modules/billing/AngularBilling';
import { useInternetStatus } from '@source/hooks/base/useInternetStatus';

export const AngularBillingModule: React.FC = () => {
  useInternetStatus();

  useEffect(
    () => () => {
      toast.remove();
    },
    [],
  );

  return (
    <ConfigProvider>
      <HashRouter>
        <AngularBilling />
        <ToastRoot />
      </HashRouter>
    </ConfigProvider>
  );
};
