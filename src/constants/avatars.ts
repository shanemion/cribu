// a set of predefined avatar icons for user profiles
export type AvatarIcon = {
  id: string;
  name: string;
  svgContent: string;
};

export const AVATAR_ICONS: AvatarIcon[] = [
  {
    id: 'avatar1',
    name: 'Professional',
    svgContent: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="45" r="25" fill="#FF4B6E"/>
      <path d="M60 80C35 80 20 95 20 110H100C100 95 85 80 60 80Z" fill="#FF4B6E"/>
    </svg>`
  },
  {
    id: 'avatar2',
    name: 'Creative',
    svgContent: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="45" r="25" fill="#4B9EFF"/>
      <path d="M60 80C35 80 20 95 20 110H100C100 95 85 80 60 80Z" fill="#4B9EFF"/>
    </svg>`
  },
  {
    id: 'avatar3',
    name: 'Adventurous',
    svgContent: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="45" r="25" fill="#4BFF9E"/>
      <path d="M60 80C35 80 20 95 20 110H100C100 95 85 80 60 80Z" fill="#4BFF9E"/>
    </svg>`
  },
  {
    id: 'avatar4',
    name: 'Friendly',
    svgContent: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="45" r="25" fill="#FFB74B"/>
      <path d="M60 80C35 80 20 95 20 110H100C100 95 85 80 60 80Z" fill="#FFB74B"/>
    </svg>`
  },
  {
    id: 'avatar5',
    name: 'Analytical',
    svgContent: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="45" r="25" fill="#9E4BFF"/>
      <path d="M60 80C35 80 20 95 20 110H100C100 95 85 80 60 80Z" fill="#9E4BFF"/>
    </svg>`
  }
];