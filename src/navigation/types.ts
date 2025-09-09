export type RootStackParamList = {
      Splash: undefined;
      MainTabs: undefined;
      CreateProduct: undefined;
      Products: undefined;
      CustomerDetailsScreen: undefined;
      BillDetailsScreen: undefined;
      PaymentScreen: undefined;
      SalesAnalytics: { updatedBill?: any };
      SalesDetail: { bill: { id: string; customerName: string; amount: number; status: 'Paid' | 'Pending' | 'Cancelled'; date: string; paymentMethod: 'Cash' | 'Online'; advanceAmount?: number; pendingAmount?: number; } };
    };

    export type RootTabParamList = {
      Home: undefined;
      Products: undefined;
      Orders: undefined;
      Bills: undefined;
      Settings: undefined;
      Billing: undefined;
    };
    

