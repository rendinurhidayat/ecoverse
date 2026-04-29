export type OrganismRole = 'producer' | 'herbivore' | 'carnivore' | 'decomposer' | 'apex_predator';
export type OrganismType = 'plant' | 'insect' | 'frog' | 'snake' | 'eagle' | 'rabbit' | 'wolf' | 'mushroom' | 'algae' | 'fish' | 'shark' | 'shrimp' | 'plankton' | 'crab' | 'otter' | 'whale' | 'crocodile';
export type HabitatType = 'forest' | 'sea' | 'ricefield' | 'river';

export interface Organism {
  id: string;
  type: OrganismType;
  role: OrganismRole;
  habitat: HabitatType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  energy: number;
  age: number;
  maxAge: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  xp: number;
  level: number;
  completedQuizzes: number;
  unlockedHabitats: HabitatType[];
  badges: string[];
  challengeProgress?: { [challengeId: string]: number };
  school?: string;
  bio?: string;
  streak?: number;
  lastLogin?: any;
}

export interface EcosystemSave {
  id?: string;
  uid: string;
  name: string;
  habitat: HabitatType;
  organisms?: Organism[];
  state?: EcosystemState;
  createdAt: any;
  updatedAt?: any;
}

export interface EcosystemStats {
  plants: number;
  herbivores: number;
  carnivores: number;
  time: string;
}

export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctIndex: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  createdBy?: string;
}

export interface Flashcard {
  id?: string;
  question: string;
  answer: string;
  category: string;
  grade: string;
  chapter: string;
}

export interface LabState {
  id?: string;
  uid: string;
  labId: string;
  data: any;
  updatedAt?: any;
}

export type WeatherType = 'normal' | 'hujan' | 'terik' | 'angin_kencang';

export interface EcosystemState {
  // Land (Darat)
  plants: number;
  herbivores: number;
  carnivores: number;
  
  // Sea (Laut)
  algae: number;
  fish: number;
  sharks: number;

  // Air (Udara)
  birds: number;
  insects: number;

  decomposers: number;
  waterQuality: number;
  temperature: number;
  stability: number;
  oxygen: number;
  soilFertility: number;
  biodiversity: number;
  weather: WeatherType;
}

export type MissionPhase = 'observe' | 'experiment' | 'decide' | 'consequence' | 'reflect';

export interface StoryChoice {
  text: string;
  effect: Partial<EcosystemState>;
  nextSceneId?: number;
  explanation: string;
}

export interface StoryScene {
  id: number;
  text: string;
  observationPrompt: string;
  experimentHint: string;
  choices: StoryChoice[];
  reflectionQuestion: string;
}

export interface StoryProgress {
  id?: string;
  uid: string;
  currentSceneId: number;
  phase: MissionPhase;
  selectedChoiceIndex: number | null;
  state: EcosystemState;
  updatedAt: any;
}

export interface QuizResult {
  id?: string;
  uid: string;
  displayName: string;
  score: number;
  totalQuestions: number;
  xpEarned: number;
  date: string; // YYYY-MM-DD
  createdAt: any;
}
