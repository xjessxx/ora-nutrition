'use client';

import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const [nutritionGoals, setNutritionGoals] = useState({
    goal: 'general_health',
    dietaryRestrictions: '',
    learningFocus: 'all',
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        nutritionGoals={nutritionGoals}
        setNutritionGoals={setNutritionGoals}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🍊</div>
            <h1 className="text-3xl font-bold text-green-800">OraNutrients</h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
          >
            Set Goals
          </button>
        </header>

        {/* Chat Interface */}
        <ChatInterface nutritionGoals={nutritionGoals} />
      </div>
    </div>
  );
}