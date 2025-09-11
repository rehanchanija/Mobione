import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProductsScreen from "../screens/ProductsScreen";
import CreateProductScreen from "../screens/CreateProductScreen";
import ProductListScreen from "../screens/ProductListScreen";

export type ProductsStackParamList = {
  Products: undefined;
  CreateProduct: undefined;
  ProductList: { brand: { id: string; name: string; emoji: string }; products: { id: string; name: string; price: string; stock: string; status: "In Stock" | "Low Stock" | "Out of Stock"; image: any; emoji: string; brandId: string; quantity?: number }[] };
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
