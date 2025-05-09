import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import type { User } from '../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [potentialMatches, setPotentialMatches] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchPotentialMatches();
  }, []);

  const fetchPotentialMatches = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data() as User;

      const q = query(
        collection(db, 'users'),
        where('internshipCity', '==', userData.internshipCity),
        where('lookingForRoommate', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const matches: User[] = [];
      
      querySnapshot.forEach((doc) => {
        const user = doc.data() as User;
        if (user.id !== currentUser.uid && 
            !userData.likes?.includes(user.id) && 
            !userData.dislikes?.includes(user.id) &&
            user.email !== userData.email) {
          const hasMatchingLifestyle = user.lifestyleTags?.some(tag => 
            userData.lifestyleTags?.includes(tag)
          );
          const hasMatchingProfessional = user.professionalTags?.some(tag => 
            userData.professionalTags?.includes(tag)
          );

          if (hasMatchingLifestyle || hasMatchingProfessional) {
            matches.push(user);
          }
        }
      });

      // Sort matches by the number of matching tags
      matches.sort((a, b) => {
        const aMatchCount = countMatchingTags(a, userData);
        const bMatchCount = countMatchingTags(b, userData);
        return bMatchCount - aMatchCount;
      });

      setPotentialMatches(matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      Alert.alert('Error', 'Failed to fetch potential matches');
    }
  };

  const handleLike = async () => {
    try {
      const currentUser = auth.currentUser;
      const likedUser = potentialMatches[currentIndex];

      if (!currentUser || !likedUser) return;

      await updateDoc(doc(db, 'users', currentUser.uid), {
        likes: [...(currentUser.likes || []), likedUser.id]
      });

      const likedUserDoc = await getDoc(doc(db, 'users', likedUser.id));
      const likedUserData = likedUserDoc.data();
      
      if (likedUserData?.likes?.includes(currentUser.uid)) {
        Alert.alert('It\'s a Match!', `You and ${likedUser.name} are cribbed up!`);
        await setDoc(doc(db, 'matches', `${currentUser.uid}_${likedUser.id}`), {
          users: [currentUser.uid, likedUser.id],
          createdAt: new Date(),
        });
      }

      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error handling like:', error);
      Alert.alert('Error', 'Failed to process like');
    }
  };

  const countMatchingTags = (user: User, currentUser: User): number => {
    let count = 0;
    user.lifestyleTags?.forEach(tag => {
      if (currentUser.lifestyleTags?.includes(tag)) count++;
    });
    user.professionalTags?.forEach(tag => {
      if (currentUser.professionalTags?.includes(tag)) count++;
    });
    return count;
  };

  const handleDislike = async () => {
    try {
      const currentUser = auth.currentUser;
      const dislikedUser = potentialMatches[currentIndex];

      if (!currentUser || !dislikedUser) return;

      await updateDoc(doc(db, 'users', currentUser.uid), {
        dislikes: [...(currentUser.dislikes || []), dislikedUser.id]
      });

      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error handling dislike:', error);
      Alert.alert('Error', 'Failed to process dislike');
    }
  };

  const currentUser = potentialMatches[currentIndex];

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.noMoreText}>No people found :(</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          // source={{ uri: currentUser.photos[0] || 'https://via.placeholder.com/300' }}
          style={styles.image}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{currentUser.name}, {currentUser.age}</Text>
          <Text style={styles.bio}>{currentUser.bio}</Text>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.button, styles.dislikeButton]} onPress={handleDislike}>
          <Text style={styles.buttonText}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.likeButton]} onPress={handleLike}>
          <Text style={styles.buttonText}>♥</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
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
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '70%',
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    color: '#666',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  button: {
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
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dislikeButton: {
    backgroundColor: '#fff',
  },
  likeButton: {
    backgroundColor: '#FF4B6E',
  },
  buttonText: {
    fontSize: 30,
    color: '#FF4B6E',
  },
  noMoreText: {
    fontSize: 20,
    color: '#666',
  },
});

export default HomeScreen;