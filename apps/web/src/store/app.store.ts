export type AppState = {
  organizationName: string;
  aiAssistantOpen: boolean;
};

export const initialAppState: AppState = {
  organizationName: "Workspace",
  aiAssistantOpen: false,
};
