import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProductsScreen from "../screens/ProductsScreen";
import CreateProductScreen from "../screens/CreateProductScreen";

export type ProductsStackParamList = {
  Products: undefined;
  CreateProduct: undefined;
};

const Stack = createNativeStackNavigator<ProductsStackParamList>();

export default function ProductsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Products" component={ProductsScreen}
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
