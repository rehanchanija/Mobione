import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BillingScreen from "../screens/CreateBillScreen";
import BillDetailsScreen from "../screens/BillDetails";
import ProductsScreen from "../screens/BrandScreen";
import ProductListScreen from "../screens/ProductListScreen";
import { RootStackParamList } from "./types";
import HomeScreen from "../screens/HomeScreen";
import BillHistoryScreen from "../screens/BillHistoryScreen";



const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Dashboard() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="BillHistory" component={BillHistoryScreen}/>
    </Stack.Navigator>
  );
}
