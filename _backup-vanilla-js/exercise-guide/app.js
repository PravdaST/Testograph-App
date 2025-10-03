// Exercise Guide App
class ExerciseGuideApp {
  constructor() {
    this.exercises = exercisesData;
    this.filteredExercises = [...this.exercises];
    this.selectedExercises = new Set();
    this.activeFilters = {
      testosterone: null,
      category: null
    };

    this.init();
  }

  init() {
    this.checkAuth();
    this.renderExercises();
    this.attachEventListeners();
    this.loadSavedSelections();
    this.updateSelectionInfo();

    // Track page view
    Analytics.track('exercise_guide_viewed', {
      total_exercises: this.exercises.length
    });
  }

  async checkAuth() {
    // Check if user is logged in
    const userEmail = localStorage.getItem('userEmail');
    const userEmailEl = document.getElementById('user-email');
    const logoutBtn = document.getElementById('logout-btn');
    const loginLink = document.getElementById('login-link');

    if (userEmail) {
      // User is logged in
      if (userEmailEl) userEmailEl.textContent = userEmail;
      if (logoutBtn) {
        logoutBtn.style.display = 'block';
        logoutBtn.addEventListener('click', () => this.logout());
      }
      if (loginLink) loginLink.style.display = 'none';

      // Try to sync favorites from Supabase
      await this.syncFromProfile();
    } else {
      // User is not logged in
      if (userEmailEl) userEmailEl.textContent = '';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (loginLink) loginLink.style.display = 'block';
    }
  }

  logout() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    window.location.href = '../index.html';
  }

  async syncFromProfile() {
    // Try to load favorites from Supabase if available
    if (typeof supabase === 'undefined') return;

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const { data: favorites } = await supabase
        .from('exercise_favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (favorites && favorites.length > 0) {
        this.selectedExercises = new Set(favorites[0].exercise_ids || []);
        this.saveSelections();
        this.updateSelectionInfo();
        this.renderExercises();
      }
    } catch (error) {
      console.log('Could not sync from profile:', error);
    }
  }

  attachEventListeners() {
    // Testosterone filter buttons
    document.querySelectorAll('.t-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const level = e.target.dataset.level;
        this.filterByTestosterone(level);
      });
    });

    // Category filter buttons
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const category = e.target.dataset.category;
        this.filterByCategory(category);
      });
    });

    // Reset filter button
    document.getElementById('resetFilters').addEventListener('click', () => {
      this.resetFilters();
    });

    // Clear selection button
    document.getElementById('clearSelection').addEventListener('click', () => {
      this.clearSelection();
    });

    // Save favorites button
    document.getElementById('saveFavorites').addEventListener('click', () => {
      this.saveFavorites();
    });
  }

  filterByTestosterone(level) {
    // Toggle filter
    if (this.activeFilters.testosterone === level) {
      this.activeFilters.testosterone = null;
    } else {
      this.activeFilters.testosterone = level;
    }

    // Update button states
    document.querySelectorAll('.t-filter-btn').forEach(btn => {
      if (btn.dataset.level === this.activeFilters.testosterone) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.applyFilters();

    Analytics.track('filter_applied', {
      type: 'testosterone',
      value: level
    });
  }

  filterByCategory(category) {
    // Toggle filter
    if (this.activeFilters.category === category) {
      this.activeFilters.category = null;
    } else {
      this.activeFilters.category = category;
    }

    // Update button states
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
      if (btn.dataset.category === this.activeFilters.category) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.applyFilters();

    Analytics.track('filter_applied', {
      type: 'category',
      value: category
    });
  }

  applyFilters() {
    this.filteredExercises = this.exercises.filter(exercise => {
      let matchT = true;
      let matchCat = true;

      if (this.activeFilters.testosterone) {
        matchT = exercise.testosterone_benefit === this.activeFilters.testosterone;
      }

      if (this.activeFilters.category) {
        matchCat = exercise.category === this.activeFilters.category;
      }

      return matchT && matchCat;
    });

    this.renderExercises();
  }

  resetFilters() {
    this.activeFilters = {
      testosterone: null,
      category: null
    };

    // Remove active class from all filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    this.filteredExercises = [...this.exercises];
    this.renderExercises();

    Analytics.track('filters_reset');
  }

  renderExercises() {
    const grid = document.getElementById('exercisesGrid');

    if (this.filteredExercises.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3>Няма намерени упражнения</h3>
          <p>Опитай да промениш филтрите</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.filteredExercises.map(exercise => {
      const isSelected = this.selectedExercises.has(exercise.id);
      const tBoostLevel = exercise.testosterone_benefit.toLowerCase();
      const tBoostStars = this.getTBoostStars(exercise.testosterone_benefit);

      return `
        <div class="exercise-card ${isSelected ? 'selected' : ''}" data-id="${exercise.id}">
          <div class="exercise-header ${tBoostLevel}">
            <input type="checkbox"
                   class="select-checkbox"
                   ${isSelected ? 'checked' : ''}
                   data-id="${exercise.id}">
            <div class="t-boost-indicator" title="Testosterone Boost Level">${tBoostStars}</div>
            <span class="exercise-icon">${exercise.icon}</span>
            <h2 class="exercise-name">${exercise.name}</h2>
            <span class="exercise-category">${exercise.category}</span>
          </div>

          <div class="exercise-body">
            <div class="exercise-protocol">
              <div class="protocol-item">
                <span class="protocol-label">Sets</span>
                <div class="protocol-value">${exercise.sets}</div>
              </div>
              <div class="protocol-item">
                <span class="protocol-label">Reps</span>
                <div class="protocol-value">${exercise.reps}</div>
              </div>
              <div class="protocol-item">
                <span class="protocol-label">Rest</span>
                <div class="protocol-value">${exercise.rest}</div>
              </div>
            </div>

            <div class="t-benefit">
              <strong>Защо повишава T:</strong> ${exercise.testosterone_why}
            </div>

            <details class="form-cues">
              <summary>Правилна техника (${exercise.form.length} съвета)</summary>
              <div class="details-content">
                <ul>
                  ${exercise.form.map(cue => `<li>${cue}</li>`).join('')}
                </ul>
              </div>
            </details>

            <details class="mistakes">
              <summary>Чести грешки (${exercise.mistakes.length})</summary>
              <div class="details-content">
                <ul>
                  ${exercise.mistakes.map(mistake => `<li>${mistake}</li>`).join('')}
                </ul>
              </div>
            </details>
          </div>
        </div>
      `;
    }).join('');

    // Attach click handlers to checkboxes
    grid.querySelectorAll('.select-checkbox').forEach(checkbox => {
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleExerciseSelection(parseInt(e.target.dataset.id));
      });
    });

    // Attach click handlers to cards (for selection)
    grid.querySelectorAll('.exercise-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't toggle if clicking on details/summary
        if (e.target.tagName === 'SUMMARY' || e.target.closest('details')) {
          return;
        }
        const id = parseInt(card.dataset.id);
        this.toggleExerciseSelection(id);
      });
    });
  }

  getTBoostStars(level) {
    switch (level) {
      case 'Висок':
        return '⚡⚡⚡';
      case 'Среден':
        return '⚡⚡';
      case 'Нисък':
        return '⚡';
      default:
        return '';
    }
  }

  toggleExerciseSelection(id) {
    if (this.selectedExercises.has(id)) {
      this.selectedExercises.delete(id);
      Analytics.track('exercise_deselected', { exercise_id: id });
    } else {
      if (this.selectedExercises.size >= 10) {
        alert('Можеш да избереш максимум 10 упражнения.');
        return;
      }
      this.selectedExercises.add(id);
      Analytics.track('exercise_selected', { exercise_id: id });
    }

    this.saveSelections();
    this.updateSelectionInfo();
    this.renderExercises();
  }

  clearSelection() {
    this.selectedExercises.clear();
    this.saveSelections();
    this.updateSelectionInfo();
    this.renderExercises();

    Analytics.track('selection_cleared');
  }

  updateSelectionInfo() {
    const count = this.selectedExercises.size;
    const info = document.getElementById('selectionInfo');
    info.innerHTML = `<strong>${count}</strong> / 10 избрани упражнения`;

    // Enable/disable save favorites button
    const saveBtn = document.getElementById('saveFavorites');
    saveBtn.disabled = count === 0;
  }

  saveSelections() {
    StorageManager.save('selected_exercises', Array.from(this.selectedExercises));
  }

  loadSavedSelections() {
    const saved = StorageManager.load('selected_exercises', []);
    this.selectedExercises = new Set(saved);
  }

  async saveFavorites() {
    if (this.selectedExercises.size === 0) {
      alert('Моля, избери поне едно упражнение.');
      return;
    }

    try {
      // Get selected exercises in order
      const selectedExerciseIds = Array.from(this.selectedExercises);
      const userId = localStorage.getItem('userId');

      // Show loading state
      const btn = document.getElementById('saveFavorites');
      const originalText = btn.innerHTML;
      btn.innerHTML = '⏳ Записване...';
      btn.disabled = true;

      // Try to save to Supabase if user is logged in
      if (userId && typeof supabase !== 'undefined') {
        try {
          const { error } = await supabase
            .from('exercise_favorites')
            .upsert([{
              user_id: userId,
              exercise_ids: selectedExerciseIds,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }], {
              onConflict: 'user_id'
            });

          if (error) throw error;

          this.showNotification('Любимите са запазени в профила ти!', 'success');

          Analytics.track('favorites_saved_supabase', {
            exercise_count: this.selectedExercises.size
          });
        } catch (error) {
          console.log('Could not save to Supabase:', error);
          this.showNotification('Любимите са запазени локално!', 'success');

          Analytics.track('favorites_saved_local', {
            exercise_count: this.selectedExercises.size
          });
        }
      } else {
        this.showNotification('Любимите са запазени локално. Влез в профил за да ги синхронизираш!', 'success');

        Analytics.track('favorites_saved_local', {
          exercise_count: this.selectedExercises.size
        });
      }

      // Restore button
      btn.innerHTML = originalText;
      btn.disabled = false;
    } catch (error) {
      console.error('Error saving favorites:', error);
      alert('Неуспешно запазване на любими. Моля, опитай отново.');

      // Restore button
      const btn = document.getElementById('saveFavorites');
      btn.innerHTML = '💾 Запази Любими';
      btn.disabled = false;

      Analytics.track('favorites_save_failed', {
        error: error.message
      });
    }
  }

  showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background: ${type === 'success' ? '#16a34a' : '#2563eb'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ExerciseGuideApp();
});

// Add animations to CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
