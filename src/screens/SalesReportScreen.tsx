import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';

interface SalesData {
  totalSales: number;
  totalOrders: number;
  averagePrice: number;
  totalCustomers: number;
  graphData: {
    labels: string[];
    datasets: number[];
  };
  trendingProducts: {
    name: string;
    sold: number;
    revenue: number;
  }[];
}

interface MockData {
  daily: SalesData;
  weekly: SalesData;
  monthly: SalesData;
  allTime: SalesData;
}

type FilterPeriod = 'daily' | 'weekly' | 'monthly' | 'allTime';

// Mock data - Replace with actual data from your backend
const mockData: MockData = {
  daily: {
    totalSales: 45250,
    totalOrders: 12,
    averagePrice: 3770,
    totalCustomers: 10,
    graphData: {
      labels: ["9AM", "12PM", "3PM", "6PM", "9PM"],
      datasets: [4500, 12000, 9000, 15000, 4750]
    },
    trendingProducts: [
      { name: "iPhone 13", sold: 3, revenue: 210000 },
      { name: "Samsung S21", sold: 2, revenue: 140000 },
      { name: "AirPods Pro", sold: 4, revenue: 100000 },
    ]
  },
  weekly: {
    totalSales: 284750,
    totalOrders: 85,
    averagePrice: 3350,
    totalCustomers: 65,
    graphData: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [45000, 38000, 65000, 42000, 49000, 35000, 10750]
    },
    trendingProducts: [
      { name: "iPhone 13", sold: 15, revenue: 1050000 },
      { name: "Samsung S21", sold: 12, revenue: 840000 },
      { name: "AirPods Pro", sold: 20, revenue: 500000 },
    ]
  },
  monthly: {
    totalSales: 1245850,
    totalOrders: 342,
    averagePrice: 3643,
    totalCustomers: 280,
    graphData: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [284750, 315000, 298000, 348100]
    },
    trendingProducts: [
      { name: "iPhone 13", sold: 58, revenue: 4060000 },
      { name: "Samsung S21", sold: 45, revenue: 3150000 },
      { name: "AirPods Pro", sold: 85, revenue: 2125000 },
    ]
  },
  allTime: {
    totalSales: 15245850,
    totalOrders: 4250,
    averagePrice: 3587,
    totalCustomers: 3200,
    graphData: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [2284750, 2515000, 2798000, 2348100, 2800000, 2500000]
    },
    trendingProducts: [
      { name: "iPhone 13", sold: 580, revenue: 40600000 },
      { name: "Samsung S21", sold: 450, revenue: 31500000 },
      { name: "AirPods Pro", sold: 850, revenue: 21250000 },
    ]
  }
};

interface FilterTabProps {
  title: string;
  emoji: string;
  isActive: boolean;
  onPress: () => void;
}

const FilterTab = ({ title, emoji, isActive, onPress }: FilterTabProps) => (
  <TouchableOpacity 
    style={[styles.filterTab, isActive && styles.filterTabActive]} 
    onPress={onPress}
  >
    <Text style={styles.filterEmoji}>{emoji}</Text>
    <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{title}</Text>
  </TouchableOpacity>
);

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
}

const StatCard = ({ title, value, icon }: StatCardProps) => (
  <View style={styles.statCard}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const SalesReportScreen = () => {
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState<FilterPeriod>('daily');

  const handleBack = () => {
    navigation.goBack();
  };

  const currentData = mockData[activeFilter];

  const formatCurrency = (amount: number): string => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Sales Report</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <FilterTab 
          title="Today" 
          emoji="📅" 
          isActive={activeFilter === 'daily'} 
          onPress={() => setActiveFilter('daily')} 
        />
        <FilterTab 
          title="This Week" 
          emoji="📆" 
          isActive={activeFilter === 'weekly'} 
          onPress={() => setActiveFilter('weekly')} 
        />
        <FilterTab 
          title="This Month" 
          emoji="📊" 
          isActive={activeFilter === 'monthly'} 
          onPress={() => setActiveFilter('monthly')} 
        />
        <FilterTab 
          title="All Time" 
          emoji="📈" 
          isActive={activeFilter === 'allTime'} 
          onPress={() => setActiveFilter('allTime')} 
        />
      </ScrollView>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard 
            title="Total Sales" 
            value={formatCurrency(currentData.totalSales)}
            icon="💰"
          />
          <StatCard 
            title="Total Orders" 
            value={currentData.totalOrders.toString()}
            icon="📦"
          />
          <StatCard 
            title="Avg. Price" 
            value={formatCurrency(currentData.averagePrice)}
            icon="💎"
          />
          <StatCard 
            title="Customers" 
            value={currentData.totalCustomers.toString()}
            icon="👥"
          />
        </View>

        {/* Sales Graph */}
        <View style={styles.graphCard}>
          <Text style={styles.graphTitle}>Sales Overview</Text>
          <LineChart
            data={{
              labels: currentData.graphData.labels,
              datasets: [{
                data: currentData.graphData.datasets
              }]
            }}
            width={Dimensions.get('window').width - 48}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(106, 90, 205, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#6a5acd"
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        </View>

        {/* Trending Products */}
        <View style={styles.trendingSection}>
          <Text style={styles.trendingTitle}>Trending Products 🔥</Text>
          {currentData.trendingProducts.map((product, index) => (
            <View key={index} style={styles.trendingItem}>
              <View style={styles.trendingLeft}>
                <Text style={styles.trendingRank}>#{index + 1}</Text>
                <Text style={styles.trendingName}>{product.name}</Text>
              </View>
              <View style={styles.trendingRight}>
                <Text style={styles.trendingSold}>{product.sold} sold</Text>
                <Text style={styles.trendingRevenue}>
                  {formatCurrency(product.revenue)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 15,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: '#374151',
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterContent: {
    paddingHorizontal: 24,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  filterTabActive: {
    backgroundColor: '#6a5acd',
  },
  filterEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  filterTextActive: {
    color: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  graphCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  trendingSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  trendingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  trendingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  trendingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingRank: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6a5acd',
    marginRight: 12,
  },
  trendingName: {
    fontSize: 15,
    color: '#111827',
  },
  trendingRight: {
    alignItems: 'flex-end',
  },
  trendingSold: {
    fontSize: 14,
    color: '#6B7280',
  },
  trendingRevenue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
});

export default SalesReportScreen;
