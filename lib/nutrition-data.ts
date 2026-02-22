export interface Food {
  food: string;
  embedding: number[];
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  calories: number;
  category: string;
  dietary?: string[];
}

import nutritionEmbeddings from '../nutrition-embeddings.json';

export const nutritionData: Food[] = nutritionEmbeddings as Food[];