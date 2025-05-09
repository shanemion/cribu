import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  Switch,
  Modal,
  FlatList,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Slider from '@react-native-community/slider';
import { AVATAR_ICONS, type AvatarIcon } from '../constants/avatars';
import { SvgXml } from 'react-native-svg';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

type RegistrationStep = 'basic' | 'lifestyle' | 'contact';

const LIFESTYLE_TAGS = [
  'Early Bird', 'Night Owl', 'Clean Freak', 'Social Butterfly',
  'Homebody', 'Fitness Enthusiast', 'Foodie', 'Pet Lover',
  'Music Lover', 'Gamer', 'Bookworm', 'Outdoorsy'
];

const PROFESSIONAL_TAGS = [
  'Tech', 'Finance', 'Marketing', 'Design',
  'Engineering', 'Healthcare', 'Education', 'Entrepreneur',
  'Research', 'Consulting', 'Startup', 'Corporate'
];

const CITIES = [
  'San Francisco, CA',
  'New York City, NY',
  'Seattle, WA',
  'Los Angeles, CA',
  'Chicago, IL',
  'Boston, MA',
  'Austin, TX',
  'Denver, CO',
  'Washington, DC',
  'San Jose, CA'
];

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [showCityModal, setShowCityModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('basic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [internshipCity, setInternshipCity] = useState('');
  const [searchRadius, setSearchRadius] = useState(10);
  const [internshipCompany, setInternshipCompany] = useState('');
  const [university, setUniversity] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [lookingForRoommate, setLookingForRoommate] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarIcon | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [lifestyleTags, setLifestyleTags] = useState<string[]>([]);
  const [professionalTags, setProfessionalTags] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [optedIntoIG, setOptedIntoIG] = useState(false);
  const [igCaption, setIgCaption] = useState('');

  const selectAvatar = (avatar: AvatarIcon) => {
    setSelectedAvatar(avatar);
    setShowAvatarModal(false);
  };

  const toggleTag = (tag: string, type: 'lifestyle' | 'professional') => {
    if (type === 'lifestyle') {
      setLifestyleTags(prev => 
        prev.includes(tag) 
          ? prev.filter(t => t !== tag)
          : [...prev, tag]
      );
    } else {
      setProfessionalTags(prev =>
        prev.includes(tag)
          ? prev.filter(t => t !== tag)
          : [...prev, tag]
      );
    }
  };

  const validateStep = (step: RegistrationStep): boolean => {
    switch (step) {
      case 'basic':
        if (!email || !password || !name || !internshipCity || !internshipCompany || !university || !gradYear) {
          Alert.alert('Error', 'Please fill in all required fields');
          return false;
        }
        if (password.length < 6) {
          Alert.alert('Error', 'Password must be at least 6 characters long');
          return false;
        }
        if (!email.includes('@')) {
          Alert.alert('Error', 'Please enter a valid email address');
          return false;
        }
        if (!email.endsWith('@stanford.edu')) {
          Alert.alert('Error', 'Please use a Stanford email address');
          return false;
        }
        return true;
      case 'lifestyle':
        if (!bio) {
          Alert.alert('Error', 'Please write a bio');
          return false;
        }
        return true;
      case 'contact':
        if (!contactEmail) {
          Alert.alert('Error', 'Please provide a contact email');
          return false;
        }
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    if (currentStep === 'basic') {
      setCurrentStep('lifestyle');
    } else if (currentStep === 'lifestyle') {
      setCurrentStep('contact');
    } else {
      handleRegister();
    }
  };

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Set selected avatar
      const avatarData = selectedAvatar ? {
        avatarId: selectedAvatar.id,
        avatarSvg: selectedAvatar.svgContent
      } : null;

      // Clean up socials object to remove undefined values
      const socials = {
        ...(instagram && { instagram }),
        ...(linkedin && { linkedin }),
        email: contactEmail,
      };

      const userData = {
        name,
        email,
        internshipCity,
        searchRadius,
        internshipCompany,
        school: university,
        gradYear: parseInt(gradYear),
        lookingForRoommate,
        lifestyleTags,
        professionalTags,
        bio,
        socials,
        optedIntoIG,
        ...(igCaption && { igCaption }),
        ...(avatarData && { avatar: avatarData }),
        lastActive: Timestamp.now(),
      };

      // Remove any undefined values from the userData object
      const cleanUserData = Object.fromEntries(
        Object.entries(userData).filter(([_, value]) => value !== undefined)
      );

      await setDoc(doc(db, 'users', user.uid), cleanUserData);
      navigation.replace('Main');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const renderBasicInfo = () => (
    <View>
      <TouchableOpacity style={styles.photoUpload} onPress={() => setShowAvatarModal(true)}>
        {selectedAvatar ? (
          <SvgXml xml={selectedAvatar.svgContent} width={120} height={120} />
        ) : (
          <Text style={styles.photoUploadText}>Select Avatar</Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={showAvatarModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Avatar</Text>
            <FlatList
              data={AVATAR_ICONS}
              numColumns={2}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.avatarItem, selectedAvatar?.id === item.id && styles.selectedAvatarItem]}
                  onPress={() => selectAvatar(item)}
                >
                  <SvgXml xml={item.svgContent} width={80} height={80} />
                  <Text style={styles.avatarName}>{item.name}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAvatarModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TextInput
        style={styles.input}
        placeholder="Email (e.g., john.doe@university.edu)"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password (min. 6 characters)"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Full Name (e.g., John Smith)"
        placeholderTextColor="#666"
        value={name}
        onChangeText={setName}
      />

      <TouchableOpacity
        style={[styles.input, styles.cityPicker]}
        onPress={() => setShowCityModal(true)}
      >
        <Text style={[styles.inputText, !internshipCity && styles.placeholder]}>
          {internshipCity || 'Select Internship City'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showCityModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Internship City</Text>
            <FlatList
              data={CITIES}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityItem}
                  onPress={() => {
                    setInternshipCity(item);
                    setShowCityModal(false);
                  }}
                >
                  <Text style={[styles.cityItemText, internshipCity === item && styles.selectedCityText]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCityModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.sliderContainer}>
        <Text style={styles.label}>Search Radius: {searchRadius} miles</Text>
        <Slider
          style={styles.slider}
          minimumValue={5}
          maximumValue={50}
          value={searchRadius}
          onValueChange={setSearchRadius}
          minimumTrackTintColor="#FF4B6E"
          maximumTrackTintColor="#ddd"
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Internship Company (e.g., Google, Meta)"
        placeholderTextColor="#666"
        value={internshipCompany}
        onChangeText={setInternshipCompany}
      />

      <TextInput
        style={styles.input}
        placeholder="University (e.g., Stanford University)"
        placeholderTextColor="#666"
        value={university}
        onChangeText={setUniversity}
      />

      <TextInput
        style={styles.input}
        placeholder="Graduation Year (e.g., 2025)"
        placeholderTextColor="#666"
        value={gradYear}
        onChangeText={setGradYear}
        keyboardType="numeric"
      />
{/* 
      <View style={styles.switchContainer}>
        <Text style={styles.label}>I'm looking for a roommate</Text>
        <Switch
          value={lookingForRoommate}
          onValueChange={setLookingForRoommate}
          trackColor={{ false: '#ddd', true: '#FF4B6E' }}
        />
      </View> */}
    </View>
  );

  const renderLifestyleInfo = () => (
    <View>
      <Text style={styles.sectionTitle}>Lifestyle Tags</Text>
      <View style={styles.tagsContainer}>
        {LIFESTYLE_TAGS.map(tag => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tag,
              lifestyleTags.includes(tag) && styles.tagActive
            ]}
            onPress={() => toggleTag(tag, 'lifestyle')}
          >
            <Text style={[
              styles.tagText,
              lifestyleTags.includes(tag) && styles.tagTextActive
            ]}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Professional Tags</Text>
      <View style={styles.tagsContainer}>
        {PROFESSIONAL_TAGS.map(tag => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tag,
              professionalTags.includes(tag) && styles.tagActive
            ]}
            onPress={() => toggleTag(tag, 'professional')}
          >
            <Text style={[
              styles.tagText,
              professionalTags.includes(tag) && styles.tagTextActive
            ]}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>What are you hoping to get out of this summer?</Text>
      <TextInput
        style={[styles.input, styles.bioInput]}
        placeholder="Share your summer goals, interests, and what you're looking for in a roommate..."
        placeholderTextColor="#666"
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={4}
      />
    </View>
  );

  const renderContactInfo = () => (
    <View>
      <TextInput
        style={styles.input}
        placeholder="Instagram Handle (e.g., @johndoe)"
        placeholderTextColor="#666"
        value={instagram}
        onChangeText={setInstagram}
      />

      <TextInput
        style={styles.input}
        placeholder="LinkedIn URL (e.g., linkedin.com/in/johndoe)"
        placeholderTextColor="#666"
        value={linkedin}
        onChangeText={setLinkedin}
      />

      <TextInput
        style={styles.input}
        placeholder="Contact Email (e.g., john.doe@university.edu)"
        placeholderTextColor="#666"
        value={contactEmail}
        onChangeText={setContactEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Opt into Instagram feature</Text>
        <Switch
          value={optedIntoIG}
          onValueChange={setOptedIntoIG}
          trackColor={{ false: '#ddd', true: '#FF4B6E' }}
        />
      </View>

      {optedIntoIG && (
        <TextInput
          style={[styles.input, styles.bioInput]}
          placeholder="Write a caption for your Instagram feature (e.g., 'Looking for a roommate in SF this summer!')"
          placeholderTextColor="#666"
          value={igCaption}
          onChangeText={setIgCaption}
          multiline
          numberOfLines={2}
        />
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      {currentStep === 'basic' && renderBasicInfo()}
      {currentStep === 'lifestyle' && renderLifestyleInfo()}
      {currentStep === 'contact' && renderContactInfo()}

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {currentStep === 'contact' ? 'Complete Registration' : 'Next'}
        </Text>
      </TouchableOpacity>

      {currentStep !== 'basic' && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(currentStep === 'contact' ? 'lifestyle' : 'basic')}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.loginText}>
          Already have an account? Login here
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  avatarItem: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    margin: 5,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  selectedAvatarItem: {
    backgroundColor: '#FFE5E5',
    borderWidth: 2,
    borderColor: '#FF4B6E',
  },
  avatarName: {
    marginTop: 5,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  cityItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cityItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedCityText: {
    color: '#FF4B6E',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 15,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FF4B6E',
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cityPicker: {
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#666',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 15,
    color: '#333',
  },
  button: {
    backgroundColor: '#FF4B6E',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
  },
  loginLink: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  loginText: {
    color: '#FF4B6E',
    fontSize: 16,
  },
  photoUpload: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoUploadText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    padding: 10,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    color: '#333',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tag: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    margin: 5,
  },
  tagActive: {
    backgroundColor: '#FF4B6E',
  },
  tagText: {
    color: '#666',
    fontSize: 14,
  },
  tagTextActive: {
    color: '#fff',
  },
});

export default RegisterScreen;