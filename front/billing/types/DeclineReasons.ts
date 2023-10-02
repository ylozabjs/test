export interface DeclineReasons {
  storageLimit?: {
    used: number;
    spaceCleared: number;
  };
  userLimit?: {
    usersCount: number;
    usersByPlan: number;
  };
  accountBillingLocked?: boolean;
  primaryCardExpired?: boolean;
}
