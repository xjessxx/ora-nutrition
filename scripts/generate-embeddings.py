import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import json

# Load ALL 5 CSV files and combine them
csv_files = [
    'FOOD-DATA-GROUP1.csv',
    'FOOD-DATA-GROUP2.csv',
    'FOOD-DATA-GROUP3.csv',
    'FOOD-DATA-GROUP4.csv',
    'FOOD-DATA-GROUP5.csv'
]

dfs = []
for file in csv_files:
    try:
        df = pd.read_csv(file)
        dfs.append(df)
    except FileNotFoundError:
        print(f"File not found: {file}")

# Combine all dataframes
df_combined = pd.concat(dfs, ignore_index=True)

# Extract the columns we need
df_clean = pd.DataFrame({
    'Food': df_combined['food'],
    'Calories': df_combined['Caloric Value'],
    'Protein_g': df_combined['Protein'],
    'Carbs_g': df_combined['Carbohydrates'],
    'Fat_g': df_combined['Fat'],
    'Fiber_g': df_combined['Dietary Fiber'],
    'Sugar_g': df_combined['Sugars']
})

# Remove any rows with missing data
df_clean = df_clean.dropna()

# Remove duplicates
df_clean = df_clean.drop_duplicates(subset=['Food'])


# Extract features for embedding
feature_columns = ['Calories', 'Protein_g', 'Carbs_g', 'Fat_g', 'Fiber_g', 'Sugar_g']
features = df_clean[feature_columns].values

# Normalize to 0-1 scale
scaler = MinMaxScaler()
embeddings = scaler.fit_transform(features)

# Categorize foods based on macronutrient content
def categorize_food(row):
    """Categorize food based on dominant macronutrient"""
    if row['Protein_g'] > 15:
        return 'protein'
    elif row['Carbs_g'] > 20:
        return 'carb'
    elif row['Fat_g'] > 10:
        return 'fat'
    else:
        return 'vegetable'

df_clean['category'] = df_clean.apply(categorize_food, axis=1)

# Determine dietary tags (vegetarian/vegan)
def get_dietary_tags(food_name):
    """Determine if food is vegetarian/vegan based on name"""
    food_lower = food_name.lower()
    tags = []
    
    # Meat/animal products (not vegetarian)
    meat_keywords = [
        'chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 
        'turkey', 'lamb', 'duck', 'bacon', 'ham', 'steak',
        'shrimp', 'crab', 'lobster', 'meat', 'sausage', 'veal',
        'anchovies', 'sardines', 'cod', 'tilapia', 'trout'
    ]
    
    # Plant-based foods (vegan)
    vegan_keywords = [
        'tofu', 'tempeh', 'lentil', 'bean', 'rice', 'quinoa', 
        'broccoli', 'spinach', 'kale', 'carrot', 'almond', 
        'walnut', 'cashew', 'oat', 'wheat', 'corn', 'pea',
        'tomato', 'lettuce', 'cucumber', 'avocado', 'apple',
        'banana', 'orange', 'berry', 'chickpea', 'soy', 
        'mushroom', 'pepper', 'onion', 'garlic', 'potato'
    ]
    
    # Vegetarian but not vegan (dairy/eggs)
    vegetarian_keywords = [
        'egg', 'milk', 'cheese', 'yogurt', 'butter', 'cream',
        'whey', 'cheddar', 'mozzarella', 'parmesan'
    ]
    
    is_meat = any(keyword in food_lower for keyword in meat_keywords)
    is_vegan = any(keyword in food_lower for keyword in vegan_keywords)
    is_vegetarian_only = any(keyword in food_lower for keyword in vegetarian_keywords)
    
    if is_vegan and not is_meat:
        tags = ['vegetarian', 'vegan']
    elif is_vegetarian_only and not is_meat:
        tags = ['vegetarian']
    elif not is_meat and not is_vegetarian_only:
        # If no meat detected and no dairy/eggs, assume vegetarian
        tags = ['vegetarian']
    
    return tags

# Generate output data
output = []

for i, row in df_clean.iterrows():
    embedding = embeddings[i].tolist()
    dietary = get_dietary_tags(row['Food'])
    
    food_obj = {
        'food': row['Food'],
        'embedding': [round(x, 2) for x in embedding],
        'protein': round(row['Protein_g'], 1),
        'carbs': round(row['Carbs_g'], 1),
        'fat': round(row['Fat_g'], 1),
        'calories': int(row['Calories']),
        'category': row['category']
    }
    
    if dietary:
        food_obj['dietary'] = dietary
    
    output.append(food_obj)

# Save to JSON file
with open('nutrition-embeddings.json', 'w') as f:
    json.dump(output, f, indent=2)

