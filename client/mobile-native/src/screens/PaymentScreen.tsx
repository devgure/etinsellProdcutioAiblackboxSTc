import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { updateUser } from '../store/slices/userSlice';
import { paymentAPI } from '../services/api';

const PaymentScreen = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (planType: 'PREMIUM' | 'GOLD') => {
    setLoading(true);
    try {
      // In a real app, this would integrate with Stripe Elements
      // For now, we'll simulate the subscription process
      const response = await paymentAPI.createSubscription({
        planType,
        paymentMethodId: 'pm_card_visa', // This would come from Stripe Elements
      });

      dispatch(updateUser({
        planType,
        subscriptionStatus: 'ACTIVE',
      }));

      Alert.alert('Success', `Successfully subscribed to ${planType} plan!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseItem = async (itemType: string, itemId?: string) => {
    setLoading(true);
    try {
      const response = await paymentAPI.purchaseItem({
        itemType,
        itemId: itemId || user.id,
        paymentMethodId: 'pm_card_visa',
      });

      Alert.alert('Success', 'Purchase completed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const renderSubscriptionPlans = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Subscription Plans</Text>

      <TouchableOpacity
        style={[styles.planCard, user.planType === 'PREMIUM' && styles.activePlan]}
        onPress={() => handleSubscribe('PREMIUM')}
        disabled={loading}
      >
        <Text style={styles.planTitle}>Premium</Text>
        <Text style={styles.planPrice}>$9.99/month</Text>
        <Text style={styles.planFeatures}>
          • Unlimited likes{'\n'}
          • See who liked you{'\n'}
          • Advanced filters
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.planCard, user.planType === 'GOLD' && styles.activePlan]}
        onPress={() => handleSubscribe('GOLD')}
        disabled={loading}
      >
        <Text style={styles.planTitle}>Gold</Text>
        <Text style={styles.planPrice}>$19.99/month</Text>
        <Text style={styles.planFeatures}>
          • All Premium features{'\n'}
          • Ad-free experience{'\n'}
          • Boost profile{'\n'}
          • Geofilters
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderInAppPurchases = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>In-App Purchases</Text>

      <TouchableOpacity
        style={styles.purchaseButton}
        onPress={() => handlePurchaseItem('UNDO_SWIPE')}
        disabled={loading}
      >
        <Text style={styles.purchaseTitle}>Undo Last Swipe</Text>
        <Text style={styles.purchasePrice}>$0.99</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.purchaseButton}
        onPress={() => handlePurchaseItem('VERIFIED_BADGE')}
        disabled={loading}
      >
        <Text style={styles.purchaseTitle}>Verified Badge</Text>
        <Text style={styles.purchasePrice}>$2.99</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.purchaseButton}
        onPress={() => handlePurchaseItem('INCOGNITO_MODE')}
        disabled={loading}
      >
        <Text style={styles.purchaseTitle}>Incognito Mode (Monthly)</Text>
        <Text style={styles.purchasePrice}>$2.99</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.purchaseButton}
        onPress={() => handlePurchaseItem('BOOST')}
        disabled={loading}
      >
        <Text style={styles.purchaseTitle}>Profile Boost (24h)</Text>
        <Text style={styles.purchasePrice}>$3.99</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGifts = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Send Gifts</Text>

      <TouchableOpacity
        style={styles.purchaseButton}
        onPress={() => handlePurchaseItem('ROSE_GIFT', 'selectedUserId')}
        disabled={loading}
      >
        <Text style={styles.purchaseTitle}>Rose</Text>
        <Text style={styles.purchasePrice}>$1.99</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.purchaseButton}
        onPress={() => handlePurchaseItem('DIAMOND_GIFT', 'selectedUserId')}
        disabled={loading}
      >
        <Text style={styles.purchaseTitle}>Diamond</Text>
        <Text style={styles.purchasePrice}>$4.99</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Premium Features</Text>

      {renderSubscriptionPlans()}
      {renderInAppPurchases()}
      {renderGifts()}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Plan</Text>
        <Text style={styles.currentPlan}>
          {user.planType || 'FREE'} - {user.subscriptionStatus || 'ACTIVE'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  planCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  activePlan: {
    borderColor: '#007bff',
    backgroundColor: '#e7f3ff',
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  planPrice: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
    marginVertical: 5,
  },
  planFeatures: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  purchaseButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  purchaseTitle: {
    fontSize: 16,
    color: '#333',
  },
  purchasePrice: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
  },
  currentPlan: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
});

export default PaymentScreen;
