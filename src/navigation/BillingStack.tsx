import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BillingScreen from "../screens/CreateBillScreen";
import BillDetailsScreen from "../screens/BillDetails";
import ProductsScreen from "../screens/BrandScreen";
import ProductListScreen from "../screens/ProductListScreen";

export type BillingStackParamList = {
  Billing: { items?: { productId: string; name: string; unitPrice: number; quantity: number }[] } | undefined;
  BillDetails: { items: { productId: string; name: string; unitPrice: number; quantity: number }[]; discount?: number } | undefined;
  Product: { selected?: { productId: string; name: string; unitPrice: number; quantity: number }[] } | undefined;
  ProductList: { brand: { id: string; name: string }; allProducts?: boolean } | undefined;
};

const Stack = createNativeStackNavigator<BillingStackParamList>();

export default function BillingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Billing" component={BillingScreen} />
      <Stack.Screen name="BillDetails" component={BillDetailsScreen} />
      <Stack.Screen name="Product" component={ProductsScreen}/>
      <Stack.Screen name="ProductList" component={ProductListScreen}/>
    </Stack.Navigator>
  );
}
