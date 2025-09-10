import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/ProfileScreen/ProfileScreen";
import SalesReportScreen from "../screens/ProfileScreen/SalesReportScreen";

export type RootStackParamList = {
  Profile: undefined;
  SalesReport: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="SalesReport" component={SalesReportScreen} />
    </Stack.Navigator>
  );
}
