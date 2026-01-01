
export type CardSize = 'small' | 'medium' | 'large';
export type CardTheme = 'default' | 'blue' | 'gray' | 'dark' | 'emerald' | 'rose' | 'amber' | 'indigo';

export interface LinkItem {
  id: string;
  label: string;
  url: string;
}

export type CardType = 'links' | 'search' | 'news' | 'directions' | 'greeting' | 'weather';

export interface BentoCardData {
  id: string;
  type: CardType;
  title: string;
  size: CardSize;
  theme: CardTheme;
  links?: LinkItem[];
  order: number;
}

export interface UserSettings {
  userName: string;
  userAddress: string;
  isDarkMode: boolean;
  calendarConnected: boolean;
  recentSearches: string[];
}