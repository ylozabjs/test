export interface BillingSwitchPlan {
  storage: number;
  burstableStorage: number;
  price: {
    month: number;
    year: number;
  };
  users: number;
}
