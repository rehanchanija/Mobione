import React, { useMemo, useState } from 'react';
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
import { useAuth } from '../../hooks/useAuth';
import { LineChart } from 'react-native-chart-kit'; 

type FilterPeriod = 'daily' | 'weekly' | 'monthly' | 'allTime';


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
  const { useSalesReport } = useAuth();

  const timeFilter = useMemo(() => {
    if (activeFilter === 'daily') return 'day';
    if (activeFilter === 'weekly') return 'week';
    if (activeFilter === 'monthly') return 'month';
    return 'all';
  }, [activeFilter]);
  const { data: reportData } = useSalesReport(timeFilter as any);

  const handleBack = () => {
    navigation.goBack();
  };

  const currentData = reportData || {
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalCustomers: 0,
    totalProductsSold: 0,
    dailyStats: [],
    topProducts: [],
    timeFilter: 'all',
  };

  const chartLabels = useMemo(() => {
    const stats = Array.isArray(currentData.dailyStats) ? currentData.dailyStats : [];
    const labels = stats.map((d) => (d?.date ? String(d.date).slice(5) : ''));
    if (labels.length < 2) {
      // Ensure at least two points to avoid chartkit path Infinity
      return [...labels, ''];
    }
    return labels;
  }, [currentData.dailyStats]);

  const chartValues = useMemo(() => {
    const stats = Array.isArray(currentData.dailyStats) ? currentData.dailyStats : [];
    const values = stats.map((d) => {
      const v = Number(d?.sales ?? 0);
      return Number.isFinite(v) ? v : 0;
    });
    if (values.length < 2) {
      return [...values, 0];
    }
    return values;
  }, [currentData.dailyStats]);

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
        contentContainerStyle={{ paddingRight: 20 }}
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
          <StatCard title="Total Sales" value={formatCurrency(currentData.totalSales)} icon="💰" />
          <StatCard 
            title="Total Orders" 
            value={currentData.totalOrders.toString()}
            icon="📦"
          />
          <StatCard 
            title="Avg. Order" 
            value={formatCurrency(currentData.averageOrderValue)}
            icon="💎"
          />
          <StatCard 
            title="Customers" 
            value={currentData.totalCustomers.toString()}
            icon="👥"
          />
          <StatCard 
            title="Total Products" 
            value={currentData.totalProductsSold.toString()}
            icon="🏷️"
          />
        </View>

        {/* Sales Graph */}
        <View style={styles.graphCard}>
          <Text style={styles.graphTitle}>Sales Overview</Text>
          <LineChart
            data={{
              labels: chartLabels,
              datasets: [{ data: chartValues }]
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
          {currentData.topProducts.slice(0, 5).map((product, index) => (
            <View key={index} style={styles.trendingItem}>
              <View style={styles.trendingLeft}>
                <Text style={styles.trendingRank}>#{index + 1}</Text>
                <Text style={styles.trendingName}>{product.name || 'Unknown'}</Text>
              </View>
              <View style={styles.trendingRight}>
                <Text style={styles.trendingSold}>{product.quantity} sold</Text>
                <Text style={styles.trendingRevenue}>
                  {formatCurrency(product.revenue || 0)}
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
    backgroundColor: '#f3f4f6b2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#374151',
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  filterContainer: {
    marginVertical: 8,
    paddingHorizontal: 22,
    paddingBottom:24
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 25,
    marginRight: 12,
    minWidth: 120,
    height: 44,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterTabActive: {
    backgroundColor: "#6a5acd",
    borderColor: "#6a5acd",
  },
  filterEmoji: {
    width: 16,
    height: 16,
    marginRight: 6,
    fontSize: 12,
    color: "#6B7280",
  },
  filterEmojiActive: {
    color: "#fff",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },
  filterTextActive: {
    color: "#fff",
  },

  container: {
    paddingHorizontal: 22,
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
    fontSize: 28,
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
