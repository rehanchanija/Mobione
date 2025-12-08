import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
      Splash: undefined;
      MainTabs: undefined;
      AuthScreen: undefined;
      CreateProduct: undefined;
      Products: undefined;
      Brand: undefined;
      ProductList: {
        brand?: { id: string; name: string; emoji: string };
        products?: { id: string; name: string; price: string; stock: string; status: "In Stock" | "Low Stock" | "Out of Stock"; image: any; emoji: string; brandId: string; quantity?: number }[];
        allProducts?: boolean;
      };
      BillDetailsScreen: undefined;
      BillHistory: { updatedBill?: any; refreshBills?: boolean; filterPending?: boolean };
      BillInvoice: { bill: { id: string; customerName: string; amount: number; status: 'Paid' | 'Pending'; date: string; paymentMethod: 'Cash' | 'Online'; advanceAmount?: number; pendingAmount?: number; } };
      EditBill: { billId: string };
      Profile: undefined;
      SalesReport: undefined;
      Settings: undefined;
      StaffManagement: undefined;
      TransactionHistory: undefined;
      AppSettings: undefined;
      HelpSupport: undefined;
      Notification: undefined;
      CreateProfile:undefined;
      HomeScreen: undefined;
    };

    export type RootTabParamList = {
      Home: undefined;
      Products: NavigatorScreenParams<RootStackParamList> | undefined;
      Bills: NavigatorScreenParams<RootStackParamList> | undefined;
      Billing: undefined;
      Transactions: undefined;
    };
    

