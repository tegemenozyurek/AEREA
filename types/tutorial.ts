export type TutorialKind = 'video' | 'guide';

export type Tutorial = {
  id: string;
  kind: TutorialKind;
  title: string;
  description: string;
  /** YouTube video ID for kind === 'video'. */
  youtubeVideoId?: string;
  /** External URL — YouTube watch link or guide page. */
  url: string;
  duration?: string;
  updatedAt: string;
};
