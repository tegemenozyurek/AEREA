export type ChatUser = {
  id: string;
  displayName: string;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export type ChatConversation = {
  id: string;
  participantIds: [string, string];
  messages: ChatMessage[];
  updatedAt: string;
};

export type ChatView = 'inbox' | 'conversation';
