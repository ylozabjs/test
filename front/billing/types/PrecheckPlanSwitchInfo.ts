export interface PrecheckPlanSwitchInfo {
  storage: {
    used: number;
    extra: number;
  };
  users: number;
  accountBillingLocked: boolean;
}
