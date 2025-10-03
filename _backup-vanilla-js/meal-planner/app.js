// Meal Planner Application Logic

class MealPlanner {
  constructor() {
    this.currentPlan = null;
    this.userParams = null;
    this.checkboxState = {}; // Store checkbox states
    this.init();
  }

  init() {
    // Set up event listeners
    document.getElementById('mealPlanForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.generatePlan();
    });

    document.getElementById('saveToSupabaseBtn')?.addEventListener('click', () => {
      this.savePlan();
    });

    document.getElementById('newPlanBtn')?.addEventListener('click', () => {
      this.resetForm();
    });

    // Modal close handlers
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.target.closest('.modal').classList.add('hidden');
      });
    });

    // Shopping list tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const week = e.target.dataset.week;
        this.showShoppingList(week);

        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    // Load saved plan if exists
    this.loadSavedPlan();
  }

  calculateMacros(age, weight, goal) {
    // BMR calculation (assume height = 175cm)
    const bmr = 10 * weight + 6.25 * 175 - 5 * age + 5;
    let tdee = bmr * 1.55; // Moderate activity

    // Adjust for goal
    if (goal === 'bulk') {
      tdee *= 1.15;
    } else if (goal === 'cut') {
      tdee *= 0.85;
    }

    // Macros for testosterone optimization
    const protein = weight * 2; // grams
    const fat = (tdee * 0.35) / 9; // grams (35% of calories)
    const carbs = (tdee - (protein * 4 + fat * 9)) / 4; // remaining

    return {
      calories: Math.round(tdee),
      protein: Math.round(protein),
      fat: Math.round(fat),
      carbs: Math.round(carbs)
    };
  }

  generatePlan() {
    // Get form data
    const age = parseInt(document.getElementById('age').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const goal = document.getElementById('goal').value;
    const budget = document.getElementById('budget').value;

    // Calculate macros
    const macros = this.calculateMacros(age, weight, goal);

    // Store user params
    this.userParams = { age, weight, goal, budget, macros };

    // Generate 30-day meal plan
    const plan = this.generate30DayPlan(macros, budget);

    // Store current plan
    this.currentPlan = {
      userParams: this.userParams,
      plan: plan,
      generatedAt: new Date().toISOString()
    };

    // Save to localStorage
    StorageManager.save('current_meal_plan', this.currentPlan);

    // Track analytics
    Analytics.track('plan_generated', {
      goal: goal,
      budget: budget,
      calories: macros.calories
    });

    // Display results
    this.displayResults();
  }

  generate30DayPlan(targetMacros, budget) {
    const plan = [];
    const dailyProtein = targetMacros.protein;
    const dailyCarbs = targetMacros.carbs;
    const dailyFat = targetMacros.fat;

    for (let day = 1; day <= 30; day++) {
      // Select meals for the day
      const breakfast = getRandomMeal('breakfast', budget);
      const lunch = getRandomMeal('lunch', budget);
      const dinner = getRandomMeal('dinner', budget);
      const snack = getRandomMeal('snacks', budget);

      // Calculate totals
      const totalProtein = breakfast.protein + lunch.protein + dinner.protein + snack.protein;
      const totalCarbs = breakfast.carbs + lunch.carbs + dinner.carbs + snack.carbs;
      const totalFat = breakfast.fat + lunch.fat + dinner.fat + snack.fat;
      const totalCalories = Math.round(totalProtein * 4 + totalCarbs * 4 + totalFat * 9);

      plan.push({
        day: day,
        meals: {
          breakfast: breakfast,
          lunch: lunch,
          dinner: dinner,
          snack: snack
        },
        totals: {
          protein: Math.round(totalProtein),
          carbs: Math.round(totalCarbs),
          fat: Math.round(totalFat),
          calories: totalCalories
        }
      });
    }

    return plan;
  }

  async displayResults() {
    // Hide input, show results
    document.getElementById('inputSection').classList.add('hidden');
    document.getElementById('resultsSection').classList.remove('hidden');

    // Load saved checkboxes
    await this.loadSavedCheckboxes();

    // Display stats
    this.displayStats();

    // Display calendar
    this.displayCalendar();

    // Display shopping lists
    this.showShoppingList(1);

    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
  }

  displayStats() {
    const { macros } = this.userParams;
    const { plan } = this.currentPlan;

    // Calculate averages
    const avgCalories = Math.round(
      plan.reduce((sum, day) => sum + day.totals.calories, 0) / plan.length
    );
    const avgProtein = Math.round(
      plan.reduce((sum, day) => sum + day.totals.protein, 0) / plan.length
    );
    const avgCarbs = Math.round(
      plan.reduce((sum, day) => sum + day.totals.carbs, 0) / plan.length
    );
    const avgFat = Math.round(
      plan.reduce((sum, day) => sum + day.totals.fat, 0) / plan.length
    );

    const statsHTML = `
      <div class="stat-card">
        <div class="stat-label">Целеви Калории</div>
        <div class="stat-value">${macros.calories}</div>
        <div class="stat-sublabel">kcal/ден</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Средни Калории</div>
        <div class="stat-value">${avgCalories}</div>
        <div class="stat-sublabel">kcal/ден</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Протеин</div>
        <div class="stat-value">${avgProtein}г</div>
        <div class="stat-sublabel">~${Math.round(avgProtein / this.userParams.weight * 10) / 10}г/кг</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Въглехидрати</div>
        <div class="stat-value">${avgCarbs}г</div>
        <div class="stat-sublabel">${Math.round(avgCarbs * 4 / avgCalories * 100)}% кал.</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Мазнини</div>
        <div class="stat-value">${avgFat}г</div>
        <div class="stat-sublabel">${Math.round(avgFat * 9 / avgCalories * 100)}% кал.</div>
      </div>
    `;

    document.getElementById('statsGrid').innerHTML = statsHTML;
  }

  displayCalendar() {
    const { plan } = this.currentPlan;

    let calendarHTML = '';
    plan.forEach(dayData => {
      const { day, meals, totals } = dayData;

      calendarHTML += `
        <div class="day-card" data-day="${day}">
          <div class="day-header">
            <span class="day-number">Ден ${day}</span>
            <span class="day-calories">${totals.calories} kcal</span>
          </div>
          <div class="day-meals">
            <div class="meal-item">
              <span class="meal-icon">🌅</span>
              <span class="meal-name">${meals.breakfast.name}</span>
            </div>
            <div class="meal-item">
              <span class="meal-icon">☀️</span>
              <span class="meal-name">${meals.lunch.name}</span>
            </div>
            <div class="meal-item">
              <span class="meal-icon">🌙</span>
              <span class="meal-name">${meals.dinner.name}</span>
            </div>
            <div class="meal-item">
              <span class="meal-icon">🍎</span>
              <span class="meal-name">${meals.snack.name}</span>
            </div>
          </div>
          <div class="day-macros">
            <span>P: ${totals.protein}г</span>
            <span>C: ${totals.carbs}г</span>
            <span>F: ${totals.fat}г</span>
          </div>
        </div>
      `;
    });

    document.getElementById('calendarGrid').innerHTML = calendarHTML;

    // Add click handlers to day cards
    document.querySelectorAll('.day-card').forEach(card => {
      card.addEventListener('click', () => {
        const day = parseInt(card.dataset.day);
        this.showDayDetails(day);
      });
    });
  }

  showDayDetails(dayNumber) {
    const dayData = this.currentPlan.plan.find(d => d.day === dayNumber);
    if (!dayData) return;

    const { meals, totals } = dayData;

    const detailsHTML = `
      <h2>Ден ${dayNumber} - Детайли</h2>

      <div class="meal-detail-section">
        <h3>🌅 Закуска - ${meals.breakfast.name}</h3>
        <div class="macros-row">
          <span>Протеин: ${meals.breakfast.protein}г</span>
          <span>Въглехидрати: ${meals.breakfast.carbs}г</span>
          <span>Мазнини: ${meals.breakfast.fat}г</span>
        </div>
        <div class="ingredients">
          <strong>Съставки:</strong>
          <ul>
            ${meals.breakfast.ingredients.map(ing => `<li>${ing}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="meal-detail-section">
        <h3>☀️ Обяд - ${meals.lunch.name}</h3>
        <div class="macros-row">
          <span>Протеин: ${meals.lunch.protein}г</span>
          <span>Въглехидрати: ${meals.lunch.carbs}г</span>
          <span>Мазнини: ${meals.lunch.fat}г</span>
        </div>
        <div class="ingredients">
          <strong>Съставки:</strong>
          <ul>
            ${meals.lunch.ingredients.map(ing => `<li>${ing}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="meal-detail-section">
        <h3>🌙 Вечеря - ${meals.dinner.name}</h3>
        <div class="macros-row">
          <span>Протеин: ${meals.dinner.protein}г</span>
          <span>Въглехидрати: ${meals.dinner.carbs}г</span>
          <span>Мазнини: ${meals.dinner.fat}г</span>
        </div>
        <div class="ingredients">
          <strong>Съставки:</strong>
          <ul>
            ${meals.dinner.ingredients.map(ing => `<li>${ing}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="meal-detail-section">
        <h3>🍎 Снакс - ${meals.snack.name}</h3>
        <div class="macros-row">
          <span>Протеин: ${meals.snack.protein}г</span>
          <span>Въглехидрати: ${meals.snack.carbs}г</span>
          <span>Мазнини: ${meals.snack.fat}г</span>
        </div>
        <div class="ingredients">
          <strong>Съставки:</strong>
          <ul>
            ${meals.snack.ingredients.map(ing => `<li>${ing}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="totals-section">
        <h3>Дневни Общи Стойности</h3>
        <div class="macros-grid">
          <div class="macro-item">
            <span class="macro-label">Калории</span>
            <span class="macro-value">${totals.calories}</span>
          </div>
          <div class="macro-item">
            <span class="macro-label">Протеин</span>
            <span class="macro-value">${totals.protein}г</span>
          </div>
          <div class="macro-item">
            <span class="macro-label">Въглехидрати</span>
            <span class="macro-value">${totals.carbs}г</span>
          </div>
          <div class="macro-item">
            <span class="macro-label">Мазнини</span>
            <span class="macro-value">${totals.fat}г</span>
          </div>
        </div>
      </div>
    `;

    document.getElementById('dayModalContent').innerHTML = detailsHTML;
    document.getElementById('dayModal').classList.remove('hidden');
  }

  showShoppingList(weekNumber) {
    const week = parseInt(weekNumber);
    const startDay = (week - 1) * 7 + 1;
    const endDay = Math.min(week * 7, 30);

    // Collect all ingredients for the week
    const ingredients = {};

    for (let day = startDay; day <= endDay; day++) {
      const dayData = this.currentPlan.plan.find(d => d.day === day);
      if (!dayData) continue;

      const { meals } = dayData;

      // Collect from all meals
      [meals.breakfast, meals.lunch, meals.dinner, meals.snack].forEach(meal => {
        meal.ingredients.forEach(ingredient => {
          if (ingredients[ingredient]) {
            ingredients[ingredient]++;
          } else {
            ingredients[ingredient] = 1;
          }
        });
      });
    }

    // Categorize ingredients
    const categories = {
      'Месо и риба': [],
      'Яйца и млечни': [],
      'Плодове и зеленчуци': [],
      'Зърнени': [],
      'Други': []
    };

    Object.entries(ingredients).forEach(([ingredient, count]) => {
      const item = { name: ingredient, count };

      // Categorize
      if (ingredient.match(/месо|пилешк|свинск|телешк|говежд|риба|сьомга|тон|скумрия|пъстърва|кюфте|ребра|шунка|кебапче|котлет|скарид/i)) {
        categories['Месо и риба'].push(item);
      } else if (ingredient.match(/яйц|мляко|сирене|кашкавал|извара|кисело мляко|фета/i)) {
        categories['Яйца и млечни'].push(item);
      } else if (ingredient.match(/домат|краставиц|салат|зеленчуц|броколи|спанак|моркови|тиквич|гъби|авокадо|зеле|лук|чесън|аспержи|боровинк|ябълк|банан|лимон/i)) {
        categories['Плодове и зеленчуци'].push(item);
      } else if (ingredient.match(/ориз|хляб|паста|овесен|мюсли|киноа|булгур|кус-кус|фили/i)) {
        categories['Зърнени'].push(item);
      } else {
        categories['Други'].push(item);
      }
    });

    // Generate HTML
    let shoppingHTML = `<h4>Седмица ${week} (Дни ${startDay}-${endDay})</h4>`;

    Object.entries(categories).forEach(([category, items]) => {
      if (items.length === 0) return;

      shoppingHTML += `
        <div class="shopping-category">
          <h5>${category}</h5>
          <ul class="shopping-list">
            ${items.map((item, index) => {
              const itemId = `week-${week}-item-${index}-${item.name.replace(/\s/g, '-')}`;
              return `
              <li>
                <input type="checkbox" id="${itemId}" data-week="${week}" data-item="${item.name}">
                <label for="${itemId}">
                  ${item.name} ${item.count > 1 ? `(×${item.count})` : ''}
                </label>
              </li>
              `;
            }).join('')}
          </ul>
        </div>
      `;
    });

    document.getElementById('shoppingLists').innerHTML = shoppingHTML;

    // Restore checkbox states
    this.restoreCheckboxes(week);

    // Add checkbox event listeners
    this.attachCheckboxListeners();
  }

  attachCheckboxListeners() {
    const checkboxes = document.querySelectorAll('.shopping-list input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const week = e.target.dataset.week;
        const item = e.target.dataset.item;
        const checked = e.target.checked;
        this.saveCheckboxState(week, item, checked);
      });
    });
  }

  saveCheckboxState(week, item, checked) {
    // Initialize week object if it doesn't exist
    if (!this.checkboxState[week]) {
      this.checkboxState[week] = {};
    }

    // Update state
    this.checkboxState[week][item] = checked;

    // Save to localStorage for all users (as fallback)
    StorageManager.save('shopping_checkboxes', this.checkboxState);

    // Check if user is logged in with Supabase
    if (window.supabase && typeof SupabaseClient !== 'undefined') {
      this.saveCheckboxesToSupabase();
    }
  }

  async saveCheckboxesToSupabase() {
    try {
      // Get current user session
      const { data: { session } } = await window.supabase.auth.getSession();

      if (session && session.user) {
        // User is logged in - save to Supabase
        const { error } = await window.supabase
          .from('meal_plan_checkboxes')
          .upsert({
            user_id: session.user.id,
            plan_id: this.currentPlan?.generatedAt || 'current',
            checkbox_state: this.checkboxState,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,plan_id'
          });

        if (error) {
          console.error('Error saving checkboxes to Supabase:', error);
        }
      }
    } catch (error) {
      console.error('Error checking Supabase session:', error);
    }
  }

  async loadCheckboxesFromSupabase() {
    try {
      // Get current user session
      const { data: { session } } = await window.supabase.auth.getSession();

      if (session && session.user) {
        // User is logged in - load from Supabase
        const { data, error } = await window.supabase
          .from('meal_plan_checkboxes')
          .select('checkbox_state')
          .eq('user_id', session.user.id)
          .eq('plan_id', this.currentPlan?.generatedAt || 'current')
          .single();

        if (data && !error) {
          this.checkboxState = data.checkbox_state || {};
          return true;
        }
      }
    } catch (error) {
      console.error('Error loading checkboxes from Supabase:', error);
    }

    // Fallback to localStorage
    return false;
  }

  restoreCheckboxes(week) {
    // Load state from memory
    const weekState = this.checkboxState[week];

    if (weekState) {
      // Restore checkbox states
      Object.entries(weekState).forEach(([item, checked]) => {
        const checkbox = document.querySelector(
          `.shopping-list input[data-week="${week}"][data-item="${item}"]`
        );
        if (checkbox) {
          checkbox.checked = checked;
        }
      });
    }
  }

  async loadSavedCheckboxes() {
    // Try to load from Supabase first
    if (window.supabase && typeof SupabaseClient !== 'undefined') {
      const loaded = await this.loadCheckboxesFromSupabase();
      if (loaded) {
        return;
      }
    }

    // Fallback to localStorage
    const saved = StorageManager.load('shopping_checkboxes');
    if (saved) {
      this.checkboxState = saved;
    }
  }

  async savePlan() {
    try {
      // Check if user is logged in (this would use actual Supabase auth)
      // For now, we'll just save to localStorage and show prompt

      const saved = StorageManager.save('saved_meal_plan', this.currentPlan);

      if (saved) {
        alert('Планът е запазен успешно в браузъра!');

        // Show prompt to create account
        document.getElementById('savePrompt').classList.remove('hidden');

        // Track analytics
        Analytics.track('plan_saved', {
          storage: 'local',
          days: 30
        });
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Грешка при запазване на плана');
    }
  }

  async loadSavedPlan() {
    const saved = StorageManager.load('current_meal_plan');
    if (saved) {
      this.currentPlan = saved;
      this.userParams = saved.userParams;
      // Load checkboxes for this plan
      await this.loadSavedCheckboxes();
      // Optionally show a notification that a plan exists
    }
  }

  resetForm() {
    document.getElementById('resultsSection').classList.add('hidden');
    document.getElementById('inputSection').classList.remove('hidden');
    document.getElementById('mealPlanForm').reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Initialize the app
let mealPlanner;
document.addEventListener('DOMContentLoaded', () => {
  mealPlanner = new MealPlanner();
});
