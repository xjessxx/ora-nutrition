import { NextResponse } from 'next/server';
import { nutritionData } from '@/lib/nutrition-data';


const goalVectors: Record<string, number[]> = {
  muscle_gain: [0.3, 1.0, 0.4, 0.2, 0.3, 0.1],
  weight_loss: [0.2, 0.6, 0.3, 0.2, 1.0, 0.1],
  energy: [0.5, 0.4, 1.0, 0.3, 0.4, 0.2],
  athletic_performance: [0.5, 0.8, 0.7, 0.3, 0.4, 0.2],
  general_health: [0.4, 0.6, 0.5, 0.3, 0.8, 0.2],
  disease_prevention: [0.3, 0.6, 0.4, 0.2, 0.9, 0.1],
};

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magA * magB);
}

export async function POST(request: Request) {
  try {
    const { goal, dietaryRestrictions, topN = 5 } = await request.json();

    console.log('Received request:', { goal, dietaryRestrictions, topN });

    const goalVector = goalVectors[goal] || goalVectors.general_health;

    // Filter by dietary restrictions
    let filteredFoods = nutritionData;
    if (dietaryRestrictions && dietaryRestrictions.trim() !== '') {
      const restrictions = dietaryRestrictions.toLowerCase();
      filteredFoods = nutritionData.filter(food => {
        if (restrictions.includes('vegetarian') && !food.dietary?.includes('vegetarian')) {
          return false;
        }
        if (restrictions.includes('vegan') && !food.dietary?.includes('vegan')) {
          return false;
        }
        return true;
      });
    }

    console.log('Filtered foods count:', filteredFoods.length);

    // Calculate similarity
    const recommendations = filteredFoods.map(food => ({
      food: food.food,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber, 
      calories: food.calories,
      category: food.category,
      goalMatch: cosineSimilarity(goalVector, food.embedding),
    }));

    recommendations.sort((a, b) => b.goalMatch - a.goalMatch);

    const result = recommendations.slice(0, topN);
    console.log('Returning recommendations:', result);

    return NextResponse.json({ recommendations: result });
  } catch (error) {
    console.error('Error in nutrition recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}