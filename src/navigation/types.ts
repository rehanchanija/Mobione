export type RootStackParamList = {
      Splash: undefined;
      MainTabs: undefined;
      CreateProduct: undefined;
      Products: undefined;
      CustomerDetailsScreen: undefined;
      BillDetailsScreen: undefined;
      PaymentScreen: undefined;
      SalesAnalytics: { updatedBill?: any };
      SalesDetail: { bill: { id: string; customerName: string; amount: number; status: 'Paid' | 'Pending'; date: string; paymentMethod: 'Cash' | 'Online'; advanceAmount?: number; pendingAmount?: number; } };
      Profile: undefined;
      SalesReport: undefined;
      Settings: undefined;
      StaffManagement: undefined;
      TransactionHistory: undefined;
      InventoryManagement: undefined;
      AppSettings: undefined;
      HelpSupport: undefined;
    };

    export type RootTabParamList = {
      Home: undefined;
      Products: undefined;
      Orders: undefined;
      Bills: undefined;
      Billing: undefined;

    };
    

