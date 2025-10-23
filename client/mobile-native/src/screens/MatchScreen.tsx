import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../store';
import { setMatches, setLoading, setError } from '../store/slices/matchSlice';
import { useAuth } from '../contexts/AuthContext';

interface Match {
  id: string;
  user: {
    id: string;
    name: string;
    photos: string[];
    bio?: string;
    interests?: string[];
  };
  status: 'pending' | 'matched' | 'rejected';
  createdAt: string;
}

const MatchScreen: React.FC = () => {
  const { token } = useAuth();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { matches, isLoading } = useSelector((state: RootState) => state.match);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      dispatch(setLoading(true));
      const response = await fetch('http://localhost:3003/api/v1/matches', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }

      const data = await response.json();
      dispatch(setMatches(data));
    } catch (error) {
      console.error('Error fetching matches:', error);
      dispatch(setError('Failed to load matches'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const startChat = (match: Match) => {
    // In a real app, navigate to chat with specific match
    navigation.navigate('Chat' as never);
  };

  const calculateAge = (birthDate: string) => {
    // This would need to be fetched from the match user data
    // For now, return a placeholder
    return 25;
  };

  const renderMatch = ({ item }: { item: Match }) => (
    <View style={styles.matchCard}>
      <Image
        source={{ uri: item.user.photos[0] || 'https://via.placeholder.com/100' }}
        style={styles.matchPhoto}
      />

      <View style={styles.matchInfo}>
        <Text style={styles.matchName}>{item.user.name}</Text>
        <Text style={styles.matchAge}>{calculateAge('1999-01-01')} years old</Text>

        {item.user.bio && (
          <Text style={styles.matchBio} numberOfLines={2}>
            {item.user.bio}
          </Text>
        )}

        {item.user.interests && item.user.interests.length > 0 && (
          <View style={styles.interestsContainer}>
            {item.user.interests.slice(0, 2).map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => startChat(item)}
      >
        <Text style={styles.chatButtonText}>💬</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading matches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Matches</Text>
        <Text style={styles.headerSubtitle}>
          {matches.length} {matches.length === 1 ? 'match' : 'matches'}
        </Text>
      </View>

      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💔</Text>
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptyText}>
            Keep swiping to find your perfect match!
          </Text>
          <TouchableOpacity
            style={styles.swipeButton}
            onPress={() => navigation.navigate('Swipe' as never)}
          >
            <Text style={styles.swipeButtonText}>Start Swiping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatch}
          contentContainerStyle={styles.matchesList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF6B6B',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
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
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  swipeButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  swipeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  matchesList: {
    padding: 15,
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matchPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  matchAge: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  matchBio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  interestTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interestText: {
    fontSize: 12,
    color: '#666',
  },
  chatButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatButtonText: {
    fontSize: 20,
  },
});

export default MatchScreen;
