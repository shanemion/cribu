export interface User {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  internshipCity: string;
  interests: string[];
  gender: 'male' | 'female' | 'other';
  lookingFor: 'male' | 'female' | 'both';
  lastActive: Date;
  lifestyleTags: string[];
  professionalTags: string[];
  likes: string[];
  dislikes: string[];
}

export interface Match {
  id: string;
  users: string[]; // Array of user IDs
  createdAt: Date;
  lastMessage?: Message;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  createdAt: Date;
  read: boolean;
}

export interface UserPreferences {
  maxDistance: number;
  ageRange: {
    min: number;
    max: number;
  };
  genderPreference: 'male' | 'female' | 'both';
} 