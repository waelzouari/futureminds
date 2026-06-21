export type AuthStackParamList = {
  Onboarding: undefined;
  RoleSelection: undefined;
  Login: undefined;
  Register: undefined;
  ChildLogin: undefined;
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
  ChildDashboard: { childId: string };
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
  GameSelection: {
    childId: string;
  };
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};
