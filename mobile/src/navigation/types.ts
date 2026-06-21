export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
};

export type ParentTabParamList = {
  Dashboard: undefined;
  Children: undefined;
  Profile: undefined;
};

export type ChildTabParamList = {
  ChildHome: { childId: string };
  GameSelection: { childId: string };
};

export type AppStackParamList = {
  ParentTabs: undefined;
  ChildTabs: { childId: string };
  ChildProfile: { childId: string; isNew?: boolean };
  CreateChild: undefined;
  UnityGame: {
    gameId: string;
    childId: string;
    sessionId: string;
    difficultyLevel?: number;
  };
  SessionReport: {
    sessionId: string;
    childId: string;
    gameId: string;
  };
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};
