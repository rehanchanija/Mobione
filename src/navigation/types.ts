export type RootStackParamList = {
      Splash: undefined;
      MainTabs: undefined;
      AuthScreen: undefined;
      CreateProduct: undefined;
      Products: undefined;
      ProductList: {
        brand: { id: string; name: string; emoji: string };
        products: any[];
      };
      BillDetailsScreen: undefined;
      SalesAnalytics: { updatedBill?: any };
      SalesDetail: { bill: { id: string; customerName: string; amount: number; status: 'Paid' | 'Pending'; date: string; paymentMethod: 'Cash' | 'Online'; advanceAmount?: number; pendingAmount?: number; } };
      Profile: undefined;
      SalesReport: undefined;
      Settings: undefined;
      StaffManagement: undefined;
      TransactionHistory: undefined;
      AppSettings: undefined;
      HelpSupport: undefined;
      Notification: undefined;
      CreateProfile:undefined;
    };

    export type RootTabParamList = {
      Home: undefined;
      Products: undefined;
      Bills: undefined;
      Billing: undefined;
      

    };
    

