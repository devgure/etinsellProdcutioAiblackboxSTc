import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

interface MatchState {
  matches: Match[];
  potentialMatches: PotentialMatch[];
  currentMatch: Match | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MatchState = {
  matches: [],
  potentialMatches: [],
  currentMatch: null,
  isLoading: false,
  error: null,
};

const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {
    setMatches: (state, action: PayloadAction<Match[]>) => {
      state.matches = action.payload;
    },
    setPotentialMatches: (state, action: PayloadAction<PotentialMatch[]>) => {
      state.potentialMatches = action.payload;
    },
    addMatch: (state, action: PayloadAction<Match>) => {
      state.matches.unshift(action.payload);
    },
    updateMatch: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const match = state.matches.find(m => m.id === action.payload.id);
      if (match) {
        match.status = action.payload.status as any;
      }
    },
    removeMatch: (state, action: PayloadAction<string>) => {
      state.matches = state.matches.filter(m => m.id !== action.payload);
    },
    setCurrentMatch: (state, action: PayloadAction<Match | null>) => {
      state.currentMatch = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearMatches: (state) => {
      state.matches = [];
      state.potentialMatches = [];
      state.currentMatch = null;
    },
  },
});

export const {
  setMatches,
  setPotentialMatches,
  addMatch,
  updateMatch,
  removeMatch,
  setCurrentMatch,
  setLoading,
  setError,
  clearMatches,
} = matchSlice.actions;

export default matchSlice.reducer;
