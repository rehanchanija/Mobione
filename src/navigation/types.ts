export type RootStackParamList = {
      Splash: undefined;
      MainTabs: undefined;
      AuthScreen: undefined;
      CreateProduct: undefined;
      Products: undefined;
      ProductList: {
        brand: string;
        products: any[];
      };
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
      AppSettings: undefined;
      HelpSupport: undefined;
      Notification: undefined;
    };

    export type RootTabParamList = {
      Home: undefined;
      Products: undefined;
      Bills: undefined;
      Billing: undefined;
      

    };
    

