// Meal database for Bulgarian meal planner
// All macros in grams, prices in budget/standard/premium tiers

const MEALS_DATABASE = {
  breakfast: [
    {
      name: "Омлет с авокадо и кашкавал",
      protein: 28,
      fat: 22,
      carbs: 12,
      price: "standard",
      ingredients: ["4 яйца", "1/2 авокадо", "50г кашкавал", "20г краве масло"]
    },
    {
      name: "Овесена каша с банан и фъстъчено масло",
      protein: 18,
      fat: 16,
      carbs: 58,
      price: "budget",
      ingredients: ["100г овесени ядки", "1 банан", "25г фъстъчено масло", "200мл мляко"]
    },
    {
      name: "Протеинови палачинки с боровинки",
      protein: 32,
      fat: 14,
      carbs: 45,
      price: "standard",
      ingredients: ["3 яйца", "30г протеинов прах", "50г овесени ядки", "100г боровинки"]
    },
    {
      name: "Гръцко кисело мляко с ядки и мед",
      protein: 22,
      fat: 18,
      carbs: 28,
      price: "standard",
      ingredients: ["250г гръцко кисело мляко", "30г смесени ядки", "20г мед"]
    },
    {
      name: "Баница с кисело мляко",
      protein: 24,
      fat: 28,
      carbs: 52,
      price: "budget",
      ingredients: ["2 парчета баница", "200г кисело мляко"]
    },
    {
      name: "Скрамбъл с шунка и домати",
      protein: 30,
      fat: 20,
      carbs: 8,
      price: "standard",
      ingredients: ["4 яйца", "100г шунка", "1 домат", "10г масло"]
    },
    {
      name: "Сьомгова пъстърва с яйца",
      protein: 35,
      fat: 24,
      carbs: 5,
      price: "standard",
      ingredients: ["100г пушена пъстърва", "3 яйца", "15г масло", "зелен лук"]
    },
    {
      name: "Мюсли с протеин и плодове",
      protein: 26,
      fat: 15,
      carbs: 62,
      price: "standard",
      ingredients: ["80г мюсли", "30г протеинов прах", "1 ябълка", "250мл мляко"]
    },
    {
      name: "Препечена филийка с пушена сьомга",
      protein: 28,
      fat: 18,
      carbs: 38,
      price: "standard",
      ingredients: ["2 филии пълнозърнест хляб", "100г пушена сьомга", "50г крема сирене"]
    },
    {
      name: "Яйца по панагюрски",
      protein: 26,
      fat: 32,
      carbs: 18,
      price: "budget",
      ingredients: ["3 яйца", "150г кисело мляко", "20г масло", "1 филия хляб"]
    },
    {
      name: "Кашкавал на скара с домати",
      protein: 24,
      fat: 26,
      carbs: 15,
      price: "budget",
      ingredients: ["150г кашкавал", "2 домата", "2 филии хляб"]
    },
    {
      name: "Протеинов шейк с овесени ядки",
      protein: 38,
      fat: 12,
      carbs: 48,
      price: "standard",
      ingredients: ["50г протеинов прах", "50г овесени ядки", "1 банан", "300мл мляко"]
    }
  ],

  lunch: [
    {
      name: "Пилешки гърди с ориз и броколи",
      protein: 48,
      fat: 14,
      carbs: 68,
      price: "budget",
      ingredients: ["200г пилешки гърди", "100г ориз", "200г броколи", "10мл зехтин"]
    },
    {
      name: "Говеждо месо с картофи и зелена салата",
      protein: 52,
      fat: 22,
      carbs: 54,
      price: "standard",
      ingredients: ["200г говеждо месо", "200г картофи", "150г салата", "15мл зехтин"]
    },
    {
      name: "Сьомга с киноа и аспержи",
      protein: 44,
      fat: 26,
      carbs: 52,
      price: "standard",
      ingredients: ["180г сьомга", "100г киноа", "200г аспержи", "15мл зехтин"]
    },
    {
      name: "Пуешко филе с батат и спанак",
      protein: 50,
      fat: 16,
      carbs: 58,
      price: "standard",
      ingredients: ["200г пуешко филе", "200г батат", "150г спанак", "10мл зехтин"]
    },
    {
      name: "Кюфтета с ориз и салата",
      protein: 42,
      fat: 28,
      carbs: 62,
      price: "budget",
      ingredients: ["4 телешки кюфтета", "100г ориз", "150г салата"]
    },
    {
      name: "Риба тон с булгур и зеленчуци",
      protein: 46,
      fat: 18,
      carbs: 56,
      price: "standard",
      ingredients: ["200г риба тон", "100г булгур", "200г микс зеленчуци"]
    },
    {
      name: "Пилешки бут с пюре и моркови",
      protein: 45,
      fat: 24,
      carbs: 58,
      price: "budget",
      ingredients: ["250г пилешки бут", "200г картофи", "150г моркови", "20мл мляко"]
    },
    {
      name: "Свински врат с ориз и лютеница",
      protein: 48,
      fat: 32,
      carbs: 64,
      price: "standard",
      ingredients: ["200г свински врат", "100г ориз", "50г лютеница", "зелена салата"]
    },
    {
      name: "Телешко филе с паста и домати",
      protein: 50,
      fat: 20,
      carbs: 72,
      price: "standard",
      ingredients: ["200г телешко филе", "100г паста", "200г чери домати", "15мл зехтин"]
    },
    {
      name: "Шницел с варени картофи и краставички",
      protein: 44,
      fat: 26,
      carbs: 56,
      price: "budget",
      ingredients: ["200г пилешко филе (панирано)", "200г картофи", "100г краставички"]
    },
    {
      name: "Скумрия на скара с печени зеленчуци",
      protein: 42,
      fat: 28,
      carbs: 32,
      price: "budget",
      ingredients: ["200г скумрия", "250г микс зеленчуци на фурна", "15мл зехтин"]
    },
    {
      name: "Пилешко кълки с кус-кус и тиквички",
      protein: 46,
      fat: 18,
      carbs: 62,
      price: "standard",
      ingredients: ["200г пилешко кълки", "100г кус-кус", "200г тиквички", "10мл зехтин"]
    },
    {
      name: "Свински ребра с печени картофи",
      protein: 44,
      fat: 36,
      carbs: 52,
      price: "standard",
      ingredients: ["250г свински ребра", "200г картофи", "BBQ сос"]
    },
    {
      name: "Пъстърва с ориз и зелен фасул",
      protein: 48,
      fat: 20,
      carbs: 58,
      price: "standard",
      ingredients: ["200г пъстърва", "100г кафяв ориз", "200г зелен фасул"]
    },
    {
      name: "Кебапчета с пържени картофи",
      protein: 40,
      fat: 34,
      carbs: 56,
      price: "budget",
      ingredients: ["4 кебапчета", "200г картофи", "лютеница", "лук"]
    }
  ],

  dinner: [
    {
      name: "Пилешка супа с ориз и зеленчуци",
      protein: 32,
      fat: 10,
      carbs: 38,
      price: "budget",
      ingredients: ["150г пилешко месо", "50г ориз", "моркови", "целина", "магданоз"]
    },
    {
      name: "Гръцка салата с пилешко",
      protein: 38,
      fat: 24,
      carbs: 18,
      price: "standard",
      ingredients: ["150г пилешко филе", "фета сирене", "маслини", "краstavици", "домати", "зехтин"]
    },
    {
      name: "Омлет с гъби и сирене",
      protein: 30,
      fat: 22,
      carbs: 12,
      price: "budget",
      ingredients: ["4 яйца", "100г гъби", "50г сирене", "15г масло"]
    },
    {
      name: "Риба хек с варени зеленчуци",
      protein: 36,
      fat: 14,
      carbs: 24,
      price: "budget",
      ingredients: ["200г риба хек", "200г микс зеленчуци", "лимон"]
    },
    {
      name: "Пуешко филе с куркума и броколи",
      protein: 42,
      fat: 12,
      carbs: 16,
      price: "standard",
      ingredients: ["180г пуешко филе", "250г броколи", "куркума", "10мл зехтин"]
    },
    {
      name: "Кюфтенца от сьомга с салата",
      protein: 38,
      fat: 22,
      carbs: 14,
      price: "standard",
      ingredients: ["180г сьомга (кюфтенца)", "150г микс салата", "лимон", "маслинено масло"]
    },
    {
      name: "Пилешки гърди с печени тиквички",
      protein: 44,
      fat: 14,
      carbs: 18,
      price: "budget",
      ingredients: ["200г пилешки гърди", "250г тиквички", "чесън", "билки"]
    },
    {
      name: "Телешко със зеленчуци на тиган",
      protein: 40,
      fat: 20,
      carbs: 22,
      price: "standard",
      ingredients: ["180г телешко месо", "200г микс зеленчуци", "соев сос", "джинджифил"]
    },
    {
      name: "Риба тон салата с яйца",
      protein: 36,
      fat: 18,
      carbs: 8,
      price: "standard",
      ingredients: ["150г риба тон (консерва)", "2 яйца", "салата айсберг", "маслини"]
    },
    {
      name: "Пилешка яхния с моркови",
      protein: 38,
      fat: 16,
      carbs: 28,
      price: "budget",
      ingredients: ["180г пилешко месо", "200г моркови", "лук", "доматен сос"]
    },
    {
      name: "Свинско филе с пържени яйца",
      protein: 46,
      fat: 28,
      carbs: 6,
      price: "standard",
      ingredients: ["150г свинско филе", "2 яйца", "зелен лук"]
    },
    {
      name: "Скариди с чесън и спанак",
      protein: 34,
      fat: 16,
      carbs: 12,
      price: "standard",
      ingredients: ["200г скариди", "200г спанак", "чесън", "зехтин"]
    },
    {
      name: "Пилешки крилца със зеле",
      protein: 36,
      fat: 24,
      carbs: 16,
      price: "budget",
      ingredients: ["250г пилешки крилца", "200г зеле", "моркови"]
    },
    {
      name: "Котлети с печени домати",
      protein: 40,
      fat: 26,
      carbs: 14,
      price: "standard",
      ingredients: ["2 свински котлети", "200г домати", "чесън", "билки"]
    },
    {
      name: "Печена риба със зеленчуци",
      protein: 42,
      fat: 18,
      carbs: 20,
      price: "standard",
      ingredients: ["200г бяла риба", "250г печени зеленчуци", "лимон", "зехтин"]
    }
  ],

  snacks: [
    {
      name: "Протеинов шейк",
      protein: 30,
      fat: 4,
      carbs: 8,
      price: "standard",
      ingredients: ["40г протеинов прах", "250мл вода"]
    },
    {
      name: "Гръцко кисело мляко с мед",
      protein: 18,
      fat: 10,
      carbs: 22,
      price: "standard",
      ingredients: ["200г гръцко кисело мляко", "15г мед"]
    },
    {
      name: "Ябълка с фъстъчено масло",
      protein: 6,
      fat: 16,
      carbs: 32,
      price: "budget",
      ingredients: ["1 голяма ябълка", "30г фъстъчено масло"]
    },
    {
      name: "Микс ядки",
      protein: 12,
      fat: 28,
      carbs: 14,
      price: "standard",
      ingredients: ["50г смесени ядки (бадеми, орехи, кашу)"]
    },
    {
      name: "Варени яйца",
      protein: 18,
      fat: 14,
      carbs: 2,
      price: "budget",
      ingredients: ["3 варени яйца"]
    },
    {
      name: "Протеинов бар",
      protein: 20,
      fat: 8,
      carbs: 24,
      price: "standard",
      ingredients: ["1 протеинов бар"]
    },
    {
      name: "Хумус с моркови",
      protein: 8,
      fat: 14,
      carbs: 26,
      price: "standard",
      ingredients: ["100г хумус", "150г моркови"]
    },
    {
      name: "Банан с бадеми",
      protein: 8,
      fat: 16,
      carbs: 38,
      price: "budget",
      ingredients: ["1 банан", "30г бадеми"]
    },
    {
      name: "Извара с боровинки",
      protein: 24,
      fat: 6,
      carbs: 18,
      price: "budget",
      ingredients: ["200г извара", "100г боровинки"]
    },
    {
      name: "Протеинови бисквити",
      protein: 16,
      fat: 12,
      carbs: 28,
      price: "standard",
      ingredients: ["2 протеинови бисквити"]
    }
  ]
};

// Helper function to get random meal of specific type and price tier
function getRandomMeal(type, priceTier) {
  const meals = MEALS_DATABASE[type].filter(meal => meal.price === priceTier);
  return meals[Math.floor(Math.random() * meals.length)];
}

// Helper function to get meals matching specific macros (approximation)
function getMealMatchingMacros(type, targetProtein, targetCarbs, priceTier) {
  const meals = MEALS_DATABASE[type].filter(meal => meal.price === priceTier);

  // Sort by how close the meal is to target macros
  meals.sort((a, b) => {
    const diffA = Math.abs(a.protein - targetProtein) + Math.abs(a.carbs - targetCarbs);
    const diffB = Math.abs(b.protein - targetProtein) + Math.abs(b.carbs - targetCarbs);
    return diffA - diffB;
  });

  return meals[0];
}
