export type WikiCategory =
  | 'Disease'
  | 'Pest'
  | 'Nutrient'
  | 'Environmental';

export type WikiArticle = {
  id: string;
  title: string;
  category: WikiCategory;
  summary: string;
  body: string;
  imageUri?: string;
  symptoms: string[];
  treatment: string[];
  updatedAt: string;
};
