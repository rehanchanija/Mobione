import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BillingScreen from "../screens/CreateBillScreen";
import BillDetailsScreen from "../screens/BillDetailsScreen";
import CustomerDetailsScreen from "../screens/CustomerDetailsScreen";
import PaymentScreen from "../screens/PaymentScreen";

export type BillingStackParamList = {
  Billing: undefined;
  BillDetails: undefined;
  CustomerDetails: undefined;
  PaymentScreen: undefined;
};

const Stack = createNativeStackNavigator<BillingStackParamList>();

export default function BillingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Billing" component={BillingScreen} />
      <Stack.Screen name="BillDetails" component={BillDetailsScreen} />
      <Stack.Screen name="CustomerDetails" component={CustomerDetailsScreen} />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen}/>
    </Stack.Navigator>
  );
}
