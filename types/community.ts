export type CommunityTopic = 'Question' | 'Advice' | 'My Experience';

export type CommunityComment = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
  replies?: CommunityComment[];
};

export type CommunityPost = {
  id: string;
  topic: CommunityTopic;
  title: string;
  body: string;
  photoUris: string[];
  authorName: string;
  likeCount: number;
  comments: CommunityComment[];
  createdAt: string;
};

export type CreatePostInput = {
  topic: CommunityTopic;
  title: string;
  body: string;
  photoUris: string[];
};
