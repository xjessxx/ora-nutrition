'use client';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  nutritionGoals: {
    goal: string;
    dietaryRestrictions: string;
    learningFocus: string;
  };
  setNutritionGoals: (goals: any) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  nutritionGoals,
  setNutritionGoals,
}: SidebarProps) {
  const handleSave = () => {
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-green-800">Nutrition Goals</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 space-y-6 overflow-y-auto">
            {/* Primary Goal */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What's your primary health goal?
              </label>
              <select
                value={nutritionGoals.goal}
                onChange={(e) =>
                  setNutritionGoals({ ...nutritionGoals, goal: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
              >
                <option value="general_health">General Health & Wellness</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="athletic_performance">Athletic Performance</option>
                <option value="energy">Increase Energy</option>
                <option value="disease_prevention">Disease Prevention</option>
              </select>
            </div>

            {/* Learning Focus */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What do you want to learn about?
              </label>
              <select
                value={nutritionGoals.learningFocus}
                onChange={(e) =>
                  setNutritionGoals({ ...nutritionGoals, learningFocus: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
              >
                <option value="all">Everything (Comprehensive)</option>
                <option value="macros">Macronutrients (Proteins, Carbs, Fats)</option>
                <option value="micros">Micronutrients (Vitamins & Minerals)</option>
                <option value="meal_planning">Meal Planning Strategies</option>
                <option value="grocery_shopping">Smart Grocery Shopping</option>
                <option value="portion_control">Portion Control</option>
                <option value="reading_labels">Reading Nutrition Labels</option>
                <option value="cooking_methods">Healthy Cooking Methods</option>
              </select>
            </div>

            {/* Dietary Restrictions */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Any dietary restrictions or preferences?
              </label>
              <textarea
                value={nutritionGoals.dietaryRestrictions}
                onChange={(e) =>
                  setNutritionGoals({
                    ...nutritionGoals,
                    dietaryRestrictions: e.target.value,
                  })
                }
                placeholder="e.g., vegetarian, gluten-free, dairy-free, allergies..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600 resize-none"
                rows={4}
              />
            </div>

            {/* Info Box */}
            <div className="bg-cyan-50 border-2 border-cyan-200 rounded-lg p-4">
              <p className="text-sm text-green-900">
                <strong>Note:</strong> Ora adapts to your goals and helps you learn
                through guidance, not by making decisions for you. This builds your
                long-term nutrition knowledge!
              </p>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full mt-6 px-6 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors"
          >
            Save & Apply Goals
          </button>
        </div>
      </div>
    </>
  );
}