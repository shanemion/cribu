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
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';

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

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
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
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [lifestyleTags, setLifestyleTags] = useState<string[]>([]);
  const [professionalTags, setProfessionalTags] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [optedIntoIG, setOptedIntoIG] = useState(false);
  const [igCaption, setIgCaption] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
    }
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
        // if (!email || !password || !name || !internshipCity || !internshipCompany || !university || !gradYear) {
        //   Alert.alert('Error', 'Please fill in all required fields');
        //   return false;
        // }
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
        socials: {
          instagram: instagram || undefined,
          linkedin: linkedin || undefined,
          email: contactEmail,
        },
        optedIntoIG,
        igCaption: igCaption || undefined,
        lastActive: Timestamp.now(),
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      navigation.replace('Main');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const renderBasicInfo = () => (
    <View>
      <TouchableOpacity style={styles.photoUpload} onPress={pickImage}>
        {profilePhoto ? (
          <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
        ) : (
          <Text style={styles.photoUploadText}>Add Profile Photo</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Full Name (e.g., John Smith)"
        placeholderTextColor="#666"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Internship City (e.g., San Francisco, CA)"
        placeholderTextColor="#666"
        value={internshipCity}
        onChangeText={setInternshipCity}
      />

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

      <View style={styles.switchContainer}>
        <Text style={styles.label}>I'm looking for a roommate</Text>
        <Switch
          value={lookingForRoommate}
          onValueChange={setLookingForRoommate}
          trackColor={{ false: '#ddd', true: '#FF4B6E' }}
        />
      </View>
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