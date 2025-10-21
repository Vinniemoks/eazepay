export type RootStackParamList = {
  // Onboarding
  Welcome: undefined;
  GetStarted: undefined;
  Register: undefined;
  Verification: { phone: string; userId: string };
  KYCUpload: { userId: string };
  PendingVerification: undefined;
  
  // Auth
  Login: undefined;
  
  // Main
  Main: undefined;
  Dashboard: undefined;
  
  // Customer Features
  SendMoney: undefined;
  Wallet: undefined;
  
  // Agent Features
  AgentRegister: undefined;
  AgentDocumentUpload: { formData: any };
  AgentPendingApproval: undefined;
  AgentDashboard: undefined;
  CustomerLookup: undefined;
  DepositCash: { customer: any };
  WithdrawCash: { customer: any };
  FloatManagement: undefined;
  FloatTopUp: undefined;
  AgentTransactions: undefined;

  // Admin Features
  AdminDashboard: undefined;
  UserManagement: undefined;
  UserDetail: { user: any };
  TransactionMonitoring: undefined;
  TransactionDetail: { transaction: any };
  AgentManagement: undefined;
  AgentDetail: { agent: any };

  // Superuser Features
  SuperuserDashboard: undefined;
  AdminManagement: undefined;
  CreateAdmin: undefined;
  AdminDetail: { admin: any };
  SystemConfiguration: undefined;
  Analytics: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
