import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProductsScreen from "../screens/BrandScreen";
import CreateProductScreen from "../screens/CreateProductScreen";
import ProductListScreen from "../screens/ProductListScreen";
import BrandScreen from "../screens/BrandScreen";
import { RootStackParamList } from "./types";



const Stack = createNativeStackNavigator<RootStackParamList>();

export default function ProductsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Brand" component={BrandScreen}
    options={{
          headerShown: false, // 👈 hide default header
        }}
   />
   <Stack.Screen name="ProductList" component={ProductListScreen}
    options={{
          headerShown: false, // 👈 hide default header
        }}
   />
   
      <Stack.Screen
        name="CreateProduct"
        component={CreateProductScreen}
        options={{ title: "➕ Create Product" ,
          headerShown:false
        }}
      />
    </Stack.Navigator>
  );
}
