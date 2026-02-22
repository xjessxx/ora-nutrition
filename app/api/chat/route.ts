import { NextResponse } from 'next/server';
import { nutritionData } from '@/lib/nutrition-data';
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface NutritionGoals {
  goal: string;
  dietaryRestrictions: string;
  learningFocus: string;
}

// Goal vectors
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

function getRecommendedFoods(goal: string, dietaryRestrictions: string) {
  const goalVector = goalVectors[goal] || goalVectors.general_health;
  
  let filteredFoods = nutritionData;
  if (dietaryRestrictions) {
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

  const recommendations = filteredFoods.map(food => ({
    ...food,
    goalMatch: cosineSimilarity(goalVector, food.embedding),
  }));

  recommendations.sort((a, b) => b.goalMatch - a.goalMatch);
  return recommendations.slice(0, 5);
}

// Simple rule-based responses (no API needed!)
function generateResponse(userMessage: string, nutritionGoals: NutritionGoals): string {
  const message = userMessage.toLowerCase();
  const recommendations = getRecommendedFoods(nutritionGoals.goal, nutritionGoals.dietaryRestrictions);
  
  // Pattern matching for common questions
  if (message.includes('protein') || message.includes('muscle')) {
    const proteinFoods = recommendations.filter(f => f.category === 'protein');
    return `Great question about protein! For your ${nutritionGoals.goal.replace('_', ' ')} goal, let's look at some excellent protein sources:

${proteinFoods.map((f, i) => `${i + 1}. ${f.food} - ${f.protein}g protein per serving`).join('\n')}

${nutritionGoals.dietaryRestrictions.includes('vegetarian') 
  ? 'Since you\'re vegetarian, notice that tofu and lentils are complete protein sources when combined with grains.' 
  : 'Chicken breast is one of the leanest protein sources available.'}

Which of these do you currently eat or would you like to learn more about?`;
  }

  if (message.includes('carb') || message.includes('energy')) {
    const carbFoods = recommendations.filter(f => f.category === 'carb');
    return `Let's talk about carbohydrates! For ${nutritionGoals.goal.replace('_', ' ')}, here are some quality carb sources:

${carbFoods.map((f, i) => `${i + 1}. ${f.food} - ${f.carbs}g carbs, ${f.fiber}g fiber`).join('\n')}

Carbs are your body's primary energy source. Complex carbs like these provide sustained energy and important nutrients. What's your typical carb intake throughout the day?`;
  }

  if (message.includes('fat') || message.includes('healthy fat')) {
    const fatFoods = recommendations.filter(f => f.category === 'fat');
    return `Good question about fats! Healthy fats are essential for hormone production and nutrient absorption:

${fatFoods.map((f, i) => `${i + 1}. ${f.food} - ${f.fat}g fat per serving`).join('\n')}

These are all sources of healthy unsaturated fats. Don't fear fat - it's crucial for your health! How do you currently include fats in your meals?`;
  }

  if (message.includes('macro') || message.includes('macronutrient')) {
    return `Excellent! Let's break down macronutrients. There are three main macros:

1. **Protein** - Building blocks for muscle, tissue repair
   Example foods: ${recommendations.filter(f => f.category === 'protein').slice(0, 2).map(f => f.food).join(', ')}

2. **Carbohydrates** - Primary energy source
   Example foods: ${recommendations.filter(f => f.category === 'carb').slice(0, 2).map(f => f.food).join(', ')}

3. **Fats** - Hormone production, nutrient absorption
   Example foods: ${recommendations.filter(f => f.category === 'fat').slice(0, 2).map(f => f.food).join(', ')}

For your ${nutritionGoals.goal.replace('_', ' ')} goal, which macro would you like to learn more about?`;
  }

  if (message.includes('meal') || message.includes('eat') || message.includes('food')) {
    return `Based on your goal of ${nutritionGoals.goal.replace('_', ' ')}, here are my top food recommendations:

${recommendations.slice(0, 5).map((f, i) => 
  `${i + 1}. ${f.food} - ${f.protein}g protein, ${f.carbs}g carbs, ${f.fat}g fat (${f.calories} calories)`
).join('\n')}

These foods align best with your goals based on their nutritional profiles. What meals do you typically eat throughout the day? Let's figure out how to incorporate these!`;
  }

  // Default response
  return `That's a great question! As your nutrition coach, I'm here to teach you about making informed food choices for your ${nutritionGoals.goal.replace('_', ' ')} goal.

Based on your profile, here are foods I recommend learning about:
${recommendations.slice(0, 3).map((f, i) => `${i + 1}. ${f.food}`).join('\n')}

Try asking me about:
- "What foods are high in protein?"
- "Help me understand macronutrients"
- "What should I eat for energy?"
- "How do I plan balanced meals?"

What would you like to learn about first?`;
}

export async function POST(request: Request) {
  try {
    const { messages, nutritionGoals } = await request.json();

    // Get the last user message
    const lastMessage = messages[messages.length - 1]?.content || '';

    // Generate response using our local model
    const response = generateResponse(lastMessage, nutritionGoals);

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}




//api key version - part 1
/*interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface NutritionGoals {
  goal: string;
  dietaryRestrictions: string;
  learningFocus: string;
}

// System prompt builder that adapts to user's goals
function buildSystemPrompt(goals: NutritionGoals, nutritionContext?: any): string {
  const goalDescriptions: Record<string, string> = {
    general_health: 'maintain overall wellness and balanced nutrition',
    weight_loss: 'achieve sustainable weight loss through healthy eating habits',
    muscle_gain: 'build muscle mass with proper protein intake and nutrition',
    athletic_performance: 'optimize nutrition for athletic performance and recovery',
    energy: 'increase energy levels through better nutrition choices',
    disease_prevention: 'prevent chronic diseases through nutritional strategies',
  };

  const focusDescriptions: Record<string, string> = {
    all: 'all aspects of nutrition comprehensively',
    macros: 'macronutrients (proteins, carbohydrates, and fats) and their roles',
    micros: 'micronutrients (vitamins and minerals) and their importance',
    meal_planning: 'practical meal planning strategies and techniques',
    grocery_shopping: 'smart grocery shopping and making informed choices at the store',
    portion_control: 'understanding appropriate portion sizes and serving sizes',
    reading_labels: 'how to read and interpret nutrition labels effectively',
    cooking_methods: 'healthy cooking methods that preserve nutrients',
  };

  const dietaryNote = goals.dietaryRestrictions
    ? `The learner has the following dietary considerations: ${goals.dietaryRestrictions}. Always keep these in mind when providing examples and guidance.`
    : '';

  const nutritionKnowledge = nutritionContext?.recommendations
    ? `
    
AVAILABLE NUTRITION KNOWLEDGE:
Based on the learner's goal (${goals.goal}) and dietary restrictions, here are relevant foods to reference in teaching:

${nutritionContext.recommendations.map((food: any, i: number) => `
${i + 1}. ${food.food}
   - Protein: ${food.protein}g | Carbs: ${food.carbs}g | Fat: ${food.fat}g | Calories: ${food.calories}
   - Goal match score: ${(food.goalMatch * 100).toFixed(0)}%
   - Use this when teaching about ${food.category} sources
`).join('')}

When the learner asks about food choices, meal planning, or what to eat, reference these foods as examples. Use the goal match scores to prioritize which foods to discuss first.
`
    : '';

  return `You are Ora, an educational nutrition coach designed to teach learners about nutrition and help them become self-sufficient in making healthy food choices. Your primary goal is to EDUCATE, not to make decisions for the learner.

LEARNER'S PROFILE:
- Primary goal: ${goalDescriptions[goals.goal] || goals.goal}
- Learning focus: ${focusDescriptions[goals.learningFocus] || goals.learningFocus}
${dietaryNote}

CORE TEACHING PRINCIPLES:
1. **Teach, Don't Prescribe**: Never create meal plans or tell learners exactly what to eat. Instead, teach them HOW to make those decisions themselves.

2. **Socratic Method**: Ask guiding questions that help learners think through their choices. For example:
   - "What macronutrients do you think you need more of based on your goals?"
   - "Looking at those two options, which one would better support your energy needs? Why?"
   - "How might you balance this meal to include all three macronutrients?"

3. **Explain the Why**: Always explain the reasoning behind nutritional concepts. Help learners understand:
   - Why certain nutrients matter for their specific goals
   - How different foods affect their body
   - The science behind nutrition recommendations

4. **Build Knowledge Progressively**: Start with foundational concepts and build up complexity. Don't overwhelm beginners with advanced topics.

5. **Use Their Context**: Reference foods and ingredients the learner mentions they have or like. Help them work with what they actually eat and enjoy.

6. **Practical Application**: Focus on actionable knowledge they can use in real situations like grocery shopping or meal prep.

7. **Encourage Critical Thinking**: Help learners evaluate food choices, compare options, and make informed decisions independently.

EXAMPLE INTERACTIONS:

 DON'T: "Here's a meal plan for you: Breakfast - oatmeal with berries, Lunch - chicken salad..."

 DO: "Let's think about breakfast options. What do you usually eat in the morning? [learner responds] Great! Now, considering your goal of [goal], what macronutrients would be most important to include at breakfast? Let me explain why..."

 DON'T: "You should eat 150g of protein per day."

 DO: "For muscle gain, protein is crucial because it provides the building blocks for muscle tissue. Let's figure out how much YOU need based on your body weight and activity level. What's your weight? [calculate together] Now, let's think about how you could distribute this across your meals using foods you enjoy..."

CONVERSATION STYLE:
- Warm, encouraging, and patient
- Use simple language but don't oversimplify concepts
- Celebrate learner insights and progress
- Be conversational but educational
- Use examples with common foods
- Break down complex topics into digestible pieces

TOPICS TO COVER (adapt based on learner's focus):
- Macronutrients: proteins, carbohydrates, fats (roles, sources, amounts)
- Micronutrients: essential vitamins and minerals
- Reading nutrition labels and ingredient lists
- Portion sizes and serving recommendations
- Meal composition and balance
- Grocery shopping strategies
- Food quality and nutrient density
- Hydration and its importance
- Cooking methods that preserve nutrients
- How to adapt eating habits sustainably

Remember: Your goal is to empower learners with knowledge and critical thinking skills so they can make informed nutrition choices for life, not just follow a plan.`;
}

export async function POST(request: Request) {
  try {
    const { messages, nutritionGoals } = await request.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const nutritionContext = await fetch('http://localhost:3000/api/nutrition-recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goal: nutritionGoals.goal,
        dietaryRestrictions: nutritionGoals.dietaryRestrictions,
        topN: 8,
      }),
    }).then(res => res.json()).catch(() => ({ recommendations: [] }));

    // Build the system prompt with nutrition context
    const systemPrompt = buildSystemPrompt(nutritionGoals, nutritionContext);

    // Format messages for OpenAI API
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg: Message) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: formattedMessages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to get response from OpenAI' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}*/