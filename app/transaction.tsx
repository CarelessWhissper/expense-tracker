import { FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSelector } from 'react-redux';

export default function TransactionsScreen() {
  const router = useRouter();
  const transactions = useSelector((state: any) => state.transactions.transactions);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(transactions.map((t: any) => t.category))];
    return ['all', ...uniqueCategories];
  }, [transactions]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter((transaction: any) => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
      const matchesType = selectedType === 'all' || 
                         (selectedType === 'income' && transaction.amount > 0) ||
                         (selectedType === 'expense' && transaction.amount < 0);
      return matchesSearch && matchesCategory && matchesType;
    });

    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'amount':
          return Math.abs(b.amount) - Math.abs(a.amount);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  }, [transactions, searchQuery, selectedCategory, selectedType, sortBy]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const income = filteredTransactions.filter((t: any) => t.amount > 0).reduce((sum: number, t: any) => sum + t.amount, 0);
    const expenses = filteredTransactions.filter((t: any) => t.amount < 0).reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
    return { income, expenses, total: income - expenses };
  }, [filteredTransactions]);

  const renderTransactionIcon = (transaction: any) => {
    const { icon, iconType } = transaction;
    const isIncome = transaction.amount > 0;
    const iconProps = { size: 24, color: '#FFF' };

    const IconComponent = (() => {
      switch (iconType) {
        case 'MaterialIcons': return MaterialIcons;
        case 'FontAwesome': return FontAwesome;
        case 'Ionicons': return Ionicons;
        case 'MaterialCommunityIcons': return MaterialCommunityIcons;
        default: return MaterialIcons;
      }
    })();

    return (
      <LinearGradient
        colors={isIncome ? ['#377D22', '#2D6419'] : ['#377D22', '#2D6419']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconGradient}
      >
        <IconComponent name={icon || 'receipt'} {...iconProps} />
      </LinearGradient>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedType('all');
    setSortBy('date');
  };

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#377D22', '#2D6419']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Transacties</Text>
            <Text style={styles.subtitle}>{filteredTransactions.length} items</Text>
          </View>
          
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="trending-up" size={20} color="#95E1D3" />
            <Text style={styles.statLabel}>Inkomen</Text>
            <Text style={styles.statValue}>SRD{stats.income.toFixed(2)}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardMiddle]}>
            <MaterialIcons name="trending-down" size={20} color="#FF6B6B" />
            <Text style={styles.statLabel}>Uitgaven</Text>
            <Text style={styles.statValue}>SRD {stats.expenses.toFixed(2)}</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="account-balance-wallet" size={20} color="#FDD835" />
            <Text style={styles.statLabel}>Totaal</Text>
            <Text style={styles.statValue}>SRD{stats.total.toFixed(2)}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {/* Type Filter */}
          {['all', 'income', 'expense'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterChip,
                selectedType === type && styles.filterChipActive,
              ]}
              onPress={() => setSelectedType(type)}
            >
              {type === 'income' && <MaterialIcons name="arrow-upward" size={14} color={selectedType === type ? '#FFF' : '#95E1D3'} />}
              {type === 'expense' && <MaterialIcons name="arrow-downward" size={14} color={selectedType === type ? '#FFF' : '#FF6B6B'} />}
              {type === 'all' && <MaterialIcons name="list" size={14} color={selectedType === type ? '#FFF' : '#377D22'} />}
              <Text
                style={[
                  styles.filterChipText,
                  selectedType === type && styles.filterChipTextActive,
                ]}
              >
                {type === 'all' ? 'Alles' : type === 'income' ? 'Inkomen' : 'Uitgaven'}
              </Text>
            </TouchableOpacity>
          ))}

          <View style={styles.filterDivider} />

          {/* Sort Options */}
          {[
            { value: 'date', label: 'Datum', icon: 'calendar-today' },
            { value: 'amount', label: 'Bedrag', icon: 'attach-money' },
            { value: 'category', label: 'Categorie', icon: 'category' },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterChip,
                sortBy === option.value && styles.filterChipActive,
              ]}
              onPress={() => setSortBy(option.value)}
            >
              <MaterialIcons 
                name={option.icon as any} 
                size={14} 
                color={sortBy === option.value ? '#FFF' : '#636E72'} 
              />
              <Text
                style={[
                  styles.filterChipText,
                  sortBy === option.value && styles.filterChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Clear Filters */}
        {(searchQuery || selectedCategory !== 'all' || selectedType !== 'all') && (
          <TouchableOpacity style={styles.clearFilters} onPress={clearFilters}>
            <MaterialIcons name="clear" size={16} color="#377D22" />
            <Text style={styles.clearFiltersText}>Wissen</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Transactions List */}
      <ScrollView 
        style={styles.transactionsList} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.transactionsContent}
      >
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={['#F7F9FC', '#E9ECEF']}
              style={styles.emptyIconContainer}
            >
              <MaterialIcons name="receipt-long" size={56} color="#ADB5BD" />
            </LinearGradient>
            <Text style={styles.emptyStateText}>Geen transacties</Text>
            <Text style={styles.emptyStateSubtext}>
              Pas je filters aan of voeg een transactie toe
            </Text>
          </View>
        ) : (
          filteredTransactions.map((transaction: any, index: number) => (
            <TouchableOpacity 
              key={transaction.id} 
              style={[
                styles.transactionItem,
                { opacity: 1 - (index * 0.02) } // Subtle fade effect
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.transactionLeft}>
                {renderTransactionIcon(transaction)}
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description}
                  </Text>
                  <View style={styles.transactionMeta}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.transactionCategory}>
                        {transaction.category}
                      </Text>
                    </View>
                    <Text style={styles.transactionDate}>
                      • {formatDate(transaction.date)}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text
                  style={[
                    styles.transactionAmount,
                    {
                      color: transaction.amount > 0 ? '#377D22' : '#e61811',
                    
                    },
                  ]}
                >
                  {transaction.amount > 0 ? '+' : ''} SRD {Math.abs(transaction.amount).toFixed(2)}
                </Text>
                {transaction.receipt && (
                  <View style={styles.receiptBadge}>
                    <MaterialIcons name="receipt" size={12} color="#377D22" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Floating Add Button with Gradient */}
      <TouchableOpacity
        style={styles.addTransactionShadow}
        onPress={() => router.push('/(modals)/transactionModal')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#377D22', '#377D22']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.addTransaction}
        >
          <MaterialIcons name="add" size={28} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  headerGradient: {
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#377D22',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 12,
    backdropFilter: 'blur(10px)',
  },
  statCardMiddle: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 4,
  },
  filtersSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: -10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    paddingVertical: 12,
  },
  filtersContainer: {
    maxHeight: 50,
  },
  filtersContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F7F9FC',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#E9ECEF',
  },
  filterChipActive: {
    backgroundColor: '#377D22',
    borderColor: '#377D22',
  },
  filterChipText: {
    fontSize: 13,
    color: '#636E72',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  filterDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E9ECEF',
    marginHorizontal: 8,
  },
  clearFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
  },
  clearFiltersText: {
    fontSize: 12,
    color: '#377D22',
    fontWeight: '600',
    marginLeft: 4,
  },
  transactionsList: {
    flex: 1,
  },
  transactionsContent: {
    padding: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
  
    marginBottom: 12,
   
    
    elevation: 3,
    
 
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 6,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: '#F0F4F8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
  },
  transactionCategory: {
    fontSize: 11,
    color: '#377D22',
    fontWeight: '600',
  },
  transactionDate: {
    fontSize: 11,
    color: '#ADB5BD',
    fontWeight: '500',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  receiptBadge: {
    backgroundColor: '#E8F5E9',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#636E72',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#ADB5BD',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  addTransactionShadow: {
    
    position: 'absolute',
    bottom: 25,
    right: 25,
  
    elevation: 10,
  },
  addTransaction: {
    
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});