import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../store';
import { setPotentialMatches, setLoading, setError } from '../store/slices/matchSlice';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

interface PotentialMatch {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  photos: string[];
  bio?: string;
  interests?: string[];
  distance?: number;
}

const SwipeScreen: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { token } = useAuth();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { potentialMatches, isLoading } = useSelector((state: RootState) => state.match);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  useEffect(() => {
    fetchPotentialMatches();
  }, []);

  const fetchPotentialMatches = async () => {
    try {
      dispatch(setLoading(true));
      const response = await fetch('http://localhost:3003/api/v1/matches/potential', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch potential matches');
      }

      const data = await response.json();
      dispatch(setPotentialMatches(data));
    } catch (error) {
      console.error('Error fetching potential matches:', error);
      dispatch(setError('Failed to load potential matches'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSwipe = async (action: 'like' | 'pass') => {
    if (!potentialMatches[currentIndex]) return;

    const targetUserId = potentialMatches[currentIndex].id;

    try {
      const response = await fetch('http://localhost:3003/api/v1/matches/swipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetUserId,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error('Swipe failed');
      }

      const data = await response.json();

      if (data.mutual) {
        Alert.alert(
          'It\'s a Match! 🎉',
          `You and ${potentialMatches[currentIndex].name} liked each other!`,
          [
            { text: 'Keep Swiping', style: 'default' },
            { text: 'Send Message', onPress: () => navigation.navigate('Chat' as never) },
          ]
        );
      }

      // Move to next card
      if (currentIndex < potentialMatches.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // No more cards, refresh
        setCurrentIndex(0);
        fetchPotentialMatches();
      }
    } catch (error) {
      console.error('Swipe error:', error);
      Alert.alert('Error', 'Failed to process swipe');
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Finding matches...</Text>
      </View>
    );
  }

  if (!potentialMatches || potentialMatches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No more potential matches nearby</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchPotentialMatches}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentMatch = potentialMatches[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Image
            source={{ uri: currentMatch.photos[0] || 'https://via.placeholder.com/300' }}
            style={styles.photo}
            resizeMode="cover"
          />

          <View style={styles.infoContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{currentMatch.name}</Text>
              <Text style={styles.age}>{calculateAge(currentMatch.birthDate)}</Text>
            </View>

            {currentMatch.distance && (
              <Text style={styles.distance}>{currentMatch.distance} km away</Text>
            )}

            {currentMatch.bio && (
              <Text style={styles.bio} numberOfLines={3}>
                {currentMatch.bio}
              </Text>
            )}

            {currentMatch.interests && currentMatch.interests.length > 0 && (
              <View style={styles.interestsContainer}>
                {currentMatch.interests.slice(0, 3).map((interest, index) => (
                  <View key={index} style={styles.interestTag}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => handleSwipe('pass')}
        >
          <Text style={[styles.actionButtonText, styles.passButtonText]}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleSwipe('like')}
        >
          <Text style={[styles.actionButtonText, styles.likeButtonText]}>♥</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: width * 0.9,
    height: height * 0.7,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '70%',
  },
  infoContainer: {
    padding: 20,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  age: {
    fontSize: 20,
    color: '#666',
  },
  distance: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 10,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 5,
  },
  interestText: {
    fontSize: 12,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  passButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  likeButton: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  passButtonText: {
    color: '#FF6B6B',
  },
  likeButtonText: {
    color: '#fff',
  },
});

export default SwipeScreen;
