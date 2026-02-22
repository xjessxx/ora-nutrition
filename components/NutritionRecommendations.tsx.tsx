'use client';

import { useEffect, useState } from 'react';

interface Food {
  food: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  goalMatch: number;
  category: string;
}

interface Props {
  goal: string;
  dietaryRestrictions: string;
}

export default function NutritionRecommendations({ goal, dietaryRestrictions }: Props) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/nutrition-recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goal, dietaryRestrictions, topN: 5 }),
        });
        const data = await response.json();
        setFoods(data.recommendations || []);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [goal, dietaryRestrictions]);

  if (loading) return <div className="text-sm text-gray-500">Loading recommendations...</div>;

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">
        Recommended Foods for Your Goal:
      </h3>
      <div className="space-y-2">
        {foods.map((food, i) => (
          <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-green-900">{food.food}</span>
              <span className="text-xs text-green-700">
                {(food.goalMatch * 100).toFixed(0)}% match
              </span>
            </div>
            <div className="text-xs text-gray-600">
              P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g • {food.calories} cal
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}