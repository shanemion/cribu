import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import type { Match, User } from '../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type MatchesScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

type MatchWithUser = Match & {
  matchedUser: User;
};

const MatchesScreen: React.FC<MatchesScreenProps> = ({ navigation }) => {
  const [matches, setMatches] = useState<MatchWithUser[]>([]);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const q = query(
        collection(db, 'matches'),
        where('users', 'array-contains', currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      const matchesData: MatchWithUser[] = [];

      for (const matchDoc of querySnapshot.docs) {
        const match = matchDoc.data() as Match;
        const otherUserId = match.users.find(id => id !== currentUser.uid);
        
        if (otherUserId) {
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          const userData = userDoc.data() as User;
          
          matchesData.push({
            ...match,
            id: matchDoc.id,
            matchedUser: userData,
          });
        }
      }

      setMatches(matchesData);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const renderMatch = ({ item }: { item: MatchWithUser }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => navigation.navigate('Chat', { 
        matchId: item.id,
        name: item.matchedUser?.name || 'Unknown User',
      })}
    >
      <Image
        source={{ uri: item.matchedUser?.photos?.[0] || 'https://via.placeholder.com/100' }}
        style={styles.avatar}
      />
      <View style={styles.matchInfo}>
        <Text style={styles.name}>{item.matchedUser?.name || 'Unknown User'}</Text>
        <Text style={styles.lastMessage}>
          {item.lastMessage?.text || 'Start a conversation!'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Matches</Text>
      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No matches yet</Text>
          <Text style={styles.emptySubtext}>
            Keep swiping to find your match!
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatch}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listContainer: {
    padding: 10,
  },
  matchCard: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  matchInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default MatchesScreen; 