import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";    
          import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BillingStackParamList } from "../navigation/BillingStack";
import { brandsApi, productsApi } from "../services/api";
import { RootStackParamList } from "../navigation/types";

type ProductsScreenNavigationProp = NativeStackNavigationProp<BillingStackParamList>;

interface Brand {
  _id: string;
  name: string; 
  productCount?: number;
}

interface Product {
  id: string;
  name: string;
  price: string;
  unitPrice: number;
  stock: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  image: any;
  emoji: string;
  brandId: string;
  quantity?: number;
}

const initialBrands: Brand[] = [];

const initialProducts: Product[] = [];

export default function BrandScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter products based on searchQuery
 
  const navigation = useNavigation<ProductsScreenNavigationProp>();
  const route = useRoute<any>();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Record<string, { id: string; name: string; unitPrice: number; quantity: number }>>({});

  const loadBrands = async () => {
    try {
      setLoading(true);
      const data = await brandsApi.list();
      // fetch product counts in parallel per brand (simple N+1; can optimize later)
      const withTotals = await Promise.all(
        data.map(async (b) => {
          try {
            const c = await brandsApi.productCount(b._id);
            return { ...b, productCount: c.productCount } as Brand;
          } catch {
            return { ...b, productCount: 0 } as Brand;
          }
        })
      );
      setBrands(withTotals);
    } catch (e) {
      Alert.alert("Error", "Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadBrands();
    } finally {
      setRefreshing(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const list = await productsApi.list();
      const mapped: Product[] = list.map((p: any) => ({
        id: p._id,
        name: p.name,
        price: `₹${p.price}`,
        unitPrice: Number(p.price) || 0,
        brandId: p.brand?._id || '',
        stock: `${p.stock} available`,
        status: p.stock > 10 ? 'In Stock' : p.stock > 0 ? 'Low Stock' : 'Out of Stock',
        image: require('../assets/phone.png'),
        emoji: '📱',
      }));
      setProducts(mapped);
    } catch (e) {
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // default to All Products when explicitly requested
    if (route.params?.allProducts) setShowAll(true);
    if (route.params?.selectForBill) { setSelectMode(true); setShowAll(true); }
    loadBrands();
    loadProducts();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadProducts();
      return () => {};
    }, [])
  );
   const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBrandPress = (brand: Brand) => {
       navigation.navigate("ProductList", {
        brand: { id: brand._id, name: brand.name }
  })
  };
  

  const handleCreateBrand = () => {
    setEditingBrand(null);
    setBrandName("");
    setModalVisible(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setModalVisible(true);
  };

  const handleDeleteBrand = (brand: Brand) => {
    Alert.alert(
      "Delete Brand",
      "Do you really want to delete this brand?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await brandsApi.remove(brand._id);
              setBrands(brands.filter(b => b._id !== brand._id));
            } catch {
              Alert.alert("Error", "Failed to delete brand");
            }
          },
        },
      ]
    );
  };

  const handleSaveBrand = async () => {
    if (!brandName.trim()) {
      Alert.alert("Error", "Please enter brand name");
      return;
    }

    try {
      if (editingBrand) {
        const updated = await brandsApi.update(editingBrand._id, { name: brandName });
        setBrands(brands.map(b => (b._id === editingBrand._id ? updated : b)));
      } else {
        const created = await brandsApi.create({ name: brandName });
        setBrands([...brands, created]);
      }
    } catch {
      Alert.alert("Error", editingBrand ? "Failed to update brand" : "Failed to create brand");
      return;
    }

    setModalVisible(false);
    setBrandName("");
    setEditingBrand(null);
  };

  const renderBrandCard = ({ item }: { item: Brand }) => (
    <View style={styles.brandCard}>
      <TouchableOpacity
        style={styles.brandContent}
        onPress={() => handleBrandPress(item)}
      >
        <Text style={styles.brandName}>{item.name}</Text>
        <Text style={styles.productCount}>{(item.productCount ?? 0)} products</Text>
      </TouchableOpacity>
      
      <View style={styles.brandActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditBrand(item)}
        >
          <Text style={styles.actionEmoji}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteBrand(item)}
        >
          <Text style={styles.actionEmoji}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{showAll ? 'All Products' : 'Brands'}</Text>
        <TouchableOpacity 
          onPress={() => { 
            const next = !showAll; 
            setShowAll(next); 
            if (next) { 
              loadProducts(); 
            } else { 
              loadBrands(); 
            } 
          }}
        >
          <Text style={styles.totalCount}>{showAll ? 'Show Brands' : 'See All Products'}</Text>
        </TouchableOpacity>
     
     
      </View>
       {showAll && (
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      )}  
      {showAll ? (
        loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
        <FlatList
          key={showAll ? 'products-list' : 'brands-grid'}
          data={filteredProducts}
          numColumns={1}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={item.image} style={styles.image} />
              <View style={styles.details}>
                <Text>{item.name}</Text>
                <Text style={styles.price}>{item.price}</Text>
                <Text style={styles.stock}>{item.stock}</Text>
              </View>
              {selectMode ? (
                // Create Bill Mode - Show increment/decrement
                <View style={{ alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => {
                      const prev = selected[item.id]?.quantity || 0;
                      const next = Math.max(0, prev - 1);
                      const copy = { ...selected } as any;
                      if (next <= 0) delete copy[item.id]; else copy[item.id] = { id: item.id, name: item.name, unitPrice: item.unitPrice, quantity: next };
                      setSelected(copy);
                    }}>
                      <Text style={{ fontSize: 20, paddingHorizontal: 8 }}>－</Text>
                    </TouchableOpacity>
                    <Text style={{ minWidth: 22, textAlign: 'center' }}>{selected[item.id]?.quantity || 0}</Text>
                    <TouchableOpacity onPress={() => {
                      const prev = selected[item.id]?.quantity || 0;
                      const next = prev + 1;
                      setSelected({ ...selected, [item.id]: { id: item.id, name: item.name, unitPrice: item.unitPrice, quantity: next } });
                    }}>
                      <Text style={{ fontSize: 20, paddingHorizontal: 8 }}>＋</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : route.params?.fromBilling ? (
                // Normal Product View - Show Sold button
                <TouchableOpacity 
                  style={styles.soldButton}
                  onPress={() => {
                    setSelected({ [item.id]: { id: item.id, name: item.name, unitPrice: item.unitPrice, quantity: 1 } });
                    setSelectMode(true);
                  }}
                >
                  <Text style={styles.soldButtonText}>Sold</Text>
                </TouchableOpacity>
              ) : (
                // Default View - Show Edit button
                <TouchableOpacity 
                  style={styles.addProductButton}
                  onPress={() => {
                    const selectedItem = {
                      productId: item.id,
                      name: item.name,
                      unitPrice: item.unitPrice,
                      quantity: 1
                    };
                    navigation.navigate('Billing', { items: [selectedItem] });
                  }}
                >
                  <Text style={styles.addProductButtonText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={!loading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#6b7280' }}>No products found.</Text>
            </View>
          ) : null}
        />
        )
      ) : (
        <FlatList
          key={showAll ? 'products-list' : 'brands-grid'}
          data={brands}
          numColumns={2}
          keyExtractor={(item) => item._id}
          renderItem={renderBrandCard}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      {!selectMode && (
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleCreateBrand}
      >
        <Text style={styles.addButtonText}>➕</Text>
      </TouchableOpacity>
      )}

      {selectMode && (
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => {
            const items = Object.values(selected).map(it => ({  productId: it.id, name: it.name, unitPrice: it.unitPrice, quantity: it.quantity}));
            console.log('Selected items:', items);
            navigation.navigate('Billing', { items });
          }}
        >
          <Text style={styles.bottomButtonText}>
            {route.params?.fromBilling ? 'Next • Create Bill' : 'Next • Add to Current Bill'}
          </Text>
        </TouchableOpacity>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editingBrand ? "Edit Brand" : "Create Brand"}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Brand Name"
              value={brandName}
              onChangeText={setBrandName}
            />
            
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveBrand}
              >
                <Text style={styles.saveButtonText}>
                  {editingBrand ? "Update" : "Create"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    padding: 15,
  },
  soldButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  soldButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  bottomButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  bottomButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16
  },
  addProductButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addProductButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  header: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingBottom: 15,
          backgroundColor: "#FFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E5E5",
          marginBottom: 10,
        },
        headerTitle: {
          fontSize: 24,
          fontWeight: "bold",
          color: "#1a1a1a",
        },
        totalCount: {
          fontSize: 18,
          color: "#666",
          fontWeight: "500",
        },
  brandCard: {
    flex: 1,
    margin: 8,
    backgroundColor: "#FFF",
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  brandContent: {
    padding: 16,
    alignItems: "center",
  },
  brandEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  brandName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#1a1a1a",
  },
  productCount: {
    fontSize: 14,
    color: "#666",
  },
  brandActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRightWidth: 0.5,
    borderRightColor: "#F0F0F0",
  },
  actionEmoji: {
    fontSize: 18,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#ffff",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  addButtonText: {
    fontSize: 28,
    color: "#eeefeefe",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    width: "85%",
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1a1a1a",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  cancelButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  saveButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#EEE",
  },
  filterButtonActive: {
    backgroundColor: "#007AFF",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  filterTextActive: {
    color: "#fff",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  price: {
    fontSize: 15,
    color: "#4A90E2",
    fontWeight: "700",
    marginTop: 4,
  },
  stock: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  searchInput: {
  backgroundColor: "#fff",
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#E5E5E5",
  paddingHorizontal: 15,
  paddingVertical: 10,
  fontSize: 16,
  marginBottom: 10,
},

});