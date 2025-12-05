import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/ProfileScreen/ProfileScreen";
import SalesReportScreen from "../screens/ProfileScreen/SalesReportScreen";
import StaffManagementScreen from "../screens/ProfileScreen/StaffManagementScreen";
import TransactionHistoryScreen from "../screens/ProfileScreen/TransactionHistoryScreen";
import AppSettingsScreen from "../screens/ProfileScreen/AppSettingsScreen";
import HelpSupportScreen from "../screens/ProfileScreen/HelpSupportScreen";
import BillsInvoice from "../screens/BillsInvoice";
import SupportChatScreen from "../screens/ProfileScreen/SupportChatScreen";

export type RootStackParamList = {
  Profile: undefined;
  SalesReport: undefined;
  StaffManagement: undefined;
  TransactionHistory: undefined;
  AppSettings: undefined;
  HelpSupport: undefined;
  SupportChat: undefined;
    BillInvoice: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="SalesReport" component={SalesReportScreen} />
      <Stack.Screen name="StaffManagement" component={StaffManagementScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
      <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="SupportChat" component={SupportChatScreen} />
      <Stack.Screen name="BillInvoice" component={BillsInvoice}
      />
    </Stack.Navigator>
  );
}
