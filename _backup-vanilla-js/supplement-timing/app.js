// Supplement Timing App - Main Logic
class SupplementTimingApp {
  constructor() {
    this.wakeTime = '07:00';
    this.workoutTime = null;
    this.schedule = [];
    this.trackingData = {};
    this.currentUser = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadSettings();
    this.loadTrackingData();
    this.generateSchedule();
    this.renderTimeline();
    this.renderInteractions();
    this.renderTrackingCalendar();
    this.checkUserAuth();
  }

  setupEventListeners() {
    document.getElementById('wakeTime')?.addEventListener('change', (e) => {
      this.wakeTime = e.target.value;
      this.saveSettings();
      this.generateSchedule();
      this.renderTimeline();
    });

    document.getElementById('workoutTime')?.addEventListener('change', (e) => {
      this.workoutTime = e.target.value === 'none' ? null : e.target.value;
      this.saveSettings();
      this.generateSchedule();
      this.renderTimeline();
    });

    document.getElementById('printBtn')?.addEventListener('click', () => {
      this.printSchedule();
    });

    document.getElementById('saveBtn')?.addEventListener('click', () => {
      this.saveScheduleToProfile();
    });

    document.getElementById('resetBtn')?.addEventListener('click', () => {
      this.resetToDefaults();
    });
  }

  loadSettings() {
    const saved = localStorage.getItem('supplementTimingSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      this.wakeTime = settings.wakeTime || '07:00';
      this.workoutTime = settings.workoutTime;

      document.getElementById('wakeTime').value = this.wakeTime;
      document.getElementById('workoutTime').value = this.workoutTime || 'none';
    }
  }

  saveSettings() {
    localStorage.setItem('supplementTimingSettings', JSON.stringify({
      wakeTime: this.wakeTime,
      workoutTime: this.workoutTime
    }));
  }

  resetToDefaults() {
    this.wakeTime = '07:00';
    this.workoutTime = null;
    document.getElementById('wakeTime').value = '07:00';
    document.getElementById('workoutTime').value = 'none';
    this.saveSettings();
    this.generateSchedule();
    this.renderTimeline();
  }

  parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  formatTime(minutes) {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  addMinutes(timeStr, minutesToAdd) {
    const totalMinutes = this.parseTime(timeStr) + minutesToAdd;
    return this.formatTime(totalMinutes);
  }

  getSupplementTime(supplement) {
    const wakeMinutes = this.parseTime(this.wakeTime);

    switch (supplement.timing) {
      case 'morning':
        // Take morning supplements 15-30 minutes after waking
        return this.formatTime(wakeMinutes + 15);

      case 'evening':
        // Take evening supplements 1-2 hours before bed (assuming 10-11pm bedtime)
        const bedMinutes = this.parseTime(this.wakeTime) + 15 * 60; // 15 hours after wake
        return this.formatTime(bedMinutes - 90); // 1.5 hours before bed

      case 'pre-workout':
        if (!this.workoutTime) return null;
        const preWorkout = this.parseTime(this.workoutTime) - 30; // 30 min before
        return this.formatTime(preWorkout);

      case 'post-workout':
        if (!this.workoutTime) {
          // If no workout, take post-workout supplements at lunch
          return this.formatTime(wakeMinutes + 5 * 60); // 5 hours after wake (lunch)
        }
        const postWorkout = this.parseTime(this.workoutTime) + 15; // 15 min after
        return this.formatTime(postWorkout);

      default:
        return null;
    }
  }

  generateSchedule() {
    this.schedule = SUPPLEMENTS_DATA
      .map(supplement => {
        const time = this.getSupplementTime(supplement);
        if (!time) return null;

        return {
          ...supplement,
          scheduledTime: time,
          timeMinutes: this.parseTime(time)
        };
      })
      .filter(item => item !== null)
      .sort((a, b) => a.timeMinutes - b.timeMinutes);
  }

  renderTimeline() {
    const container = document.getElementById('timeline');
    if (!container) return;

    container.innerHTML = '';

    // Create timeline hours
    const startHour = Math.floor(this.parseTime(this.wakeTime) / 60);
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push((startHour + i) % 24);
    }

    // Group supplements by time
    const groupedByTime = {};
    this.schedule.forEach(item => {
      if (!groupedByTime[item.scheduledTime]) {
        groupedByTime[item.scheduledTime] = [];
      }
      groupedByTime[item.scheduledTime].push(item);
    });

    // Create timeline with supplements
    hours.forEach((hour, index) => {
      const hourEl = document.createElement('div');
      hourEl.className = 'timeline-hour';

      const timeLabel = document.createElement('div');
      timeLabel.className = 'hour-label';
      timeLabel.textContent = `${hour.toString().padStart(2, '0')}:00`;
      hourEl.appendChild(timeLabel);

      // Add supplements for this hour
      const hourStart = hour * 60;
      const hourEnd = hourStart + 60;

      Object.entries(groupedByTime).forEach(([time, supplements]) => {
        const timeMinutes = this.parseTime(time);
        if (timeMinutes >= hourStart && timeMinutes < hourEnd) {
          supplements.forEach(supplement => {
            const card = this.createSupplementCard(supplement);
            hourEl.appendChild(card);
          });
        }
      });

      container.appendChild(hourEl);
    });

    this.updateSummary();
  }

  createSupplementCard(supplement) {
    const card = document.createElement('div');
    card.className = 'supplement-card';
    card.style.borderLeftColor = supplement.color;

    card.innerHTML = `
      <div class="card-header">
        <div class="card-time">${supplement.scheduledTime}</div>
        <div class="card-category category-${supplement.category}">
          ${this.getCategoryIcon(supplement.category)}
        </div>
      </div>
      <div class="card-name">${supplement.name}</div>
      <div class="card-dosage">${supplement.dosage}</div>
      <div class="card-food">${supplement.withFood}</div>
      <div class="card-why">${supplement.why}</div>
    `;

    return card;
  }

  getCategoryIcon(category) {
    const icons = {
      testosterone: '💪',
      sleep: '😴',
      workout: '🏋️'
    };
    return icons[category] || '💊';
  }

  renderInteractions() {
    const container = document.getElementById('interactions');
    if (!container) return;

    container.innerHTML = '<h3>⚠️ НИКОГА НЕ КОМБИНИРАЙТЕ</h3>';

    INTERACTIONS.forEach(interaction => {
      const item = document.createElement('div');
      item.className = `interaction-item severity-${interaction.severity}`;

      item.innerHTML = `
        <div class="interaction-supplements">
          ${interaction.supplements.join(' + ')}
        </div>
        <div class="interaction-warning">${interaction.warning}</div>
      `;

      container.appendChild(item);
    });
  }

  updateSummary() {
    const summary = document.getElementById('summary');
    if (!summary) return;

    const byCategory = {
      testosterone: 0,
      sleep: 0,
      workout: 0
    };

    this.schedule.forEach(item => {
      byCategory[item.category]++;
    });

    summary.innerHTML = `
      <div class="summary-item">
        <span class="summary-label">Общо добавки:</span>
        <span class="summary-value">${this.schedule.length}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">За тестостерон:</span>
        <span class="summary-value">${byCategory.testosterone}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">За сън:</span>
        <span class="summary-value">${byCategory.sleep}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">За тренировка:</span>
        <span class="summary-value">${byCategory.workout}</span>
      </div>
    `;
  }

  async printSchedule() {
    // Track print event if analytics is available
    if (typeof Analytics !== 'undefined') {
      Analytics.track('print_schedule', {
        scheduleCount: this.schedule.length,
        wakeTime: this.wakeTime,
        hasWorkout: !!this.workoutTime
      });
    }

    // Use browser native print
    window.print();
  }

  async checkUserAuth() {
    // Check if user is logged in (placeholder - would integrate with actual auth)
    const userString = localStorage.getItem('currentUser');
    if (userString) {
      this.currentUser = JSON.parse(userString);
      document.getElementById('saveBtn').style.display = 'flex';
      await this.loadScheduleFromProfile();
    }
  }

  async saveScheduleToProfile() {
    if (!this.currentUser) {
      alert('Моля, влез в профила си, за да запазиш графика.');
      return;
    }

    const scheduleData = {
      wake_time: this.wakeTime,
      workout_time: this.workoutTime,
      schedule_data: {
        schedule: this.schedule,
        generatedAt: new Date().toISOString()
      }
    };

    // Save to localStorage (fallback)
    localStorage.setItem('supplementSchedule', JSON.stringify(scheduleData));

    // Try to save to Supabase if available
    if (typeof supabase !== 'undefined') {
      try {
        await supabase.insert('supplement_schedules', {
          user_id: this.currentUser.id,
          ...scheduleData,
          created_at: new Date().toISOString()
        });
        alert('Графикът е запазен успешно!');
      } catch (error) {
        console.error('Error saving to Supabase:', error);
        alert('Графикът е запазен локално.');
      }
    } else {
      alert('Графикът е запазен локално.');
    }

    // Track analytics
    if (typeof Analytics !== 'undefined') {
      Analytics.track('schedule_saved', {
        hasWorkout: !!this.workoutTime
      });
    }
  }

  async loadScheduleFromProfile() {
    // Try to load from localStorage first
    const saved = localStorage.getItem('supplementSchedule');
    if (saved) {
      const data = JSON.parse(saved);
      this.wakeTime = data.wake_time;
      this.workoutTime = data.workout_time;
      document.getElementById('wakeTime').value = this.wakeTime;
      document.getElementById('workoutTime').value = this.workoutTime || 'none';
      this.generateSchedule();
      this.renderTimeline();
    }

    // Try to load from Supabase if available
    if (typeof supabase !== 'undefined' && this.currentUser) {
      try {
        const results = await supabase.query('supplement_schedules', {
          filter: { user_id: this.currentUser.id },
          order: 'created_at.desc',
          limit: 1
        });

        if (results && results.length > 0) {
          const data = results[0];
          this.wakeTime = data.wake_time;
          this.workoutTime = data.workout_time;
          document.getElementById('wakeTime').value = this.wakeTime;
          document.getElementById('workoutTime').value = this.workoutTime || 'none';
          this.generateSchedule();
          this.renderTimeline();
        }
      } catch (error) {
        console.error('Error loading from Supabase:', error);
      }
    }
  }

  loadTrackingData() {
    const saved = localStorage.getItem('supplementTracking');
    if (saved) {
      this.trackingData = JSON.parse(saved);
    }
  }

  saveTrackingData() {
    localStorage.setItem('supplementTracking', JSON.stringify(this.trackingData));
  }

  toggleDayTracking(dateStr) {
    if (this.trackingData[dateStr]) {
      delete this.trackingData[dateStr];
    } else {
      this.trackingData[dateStr] = true;
    }
    this.saveTrackingData();
    this.renderTrackingCalendar();
  }

  renderTrackingCalendar() {
    const container = document.getElementById('trackingCalendar');
    const statsContainer = document.getElementById('trackingStats');
    if (!container || !statsContainer) return;

    // Generate 30 days starting from today
    const today = new Date();
    const days = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (29 - i));
      days.push(date);
    }

    // Calculate stats
    let takenCount = 0;
    let totalDays = 30;

    container.innerHTML = '';

    days.forEach((date) => {
      const dateStr = date.toISOString().split('T')[0];
      const isTaken = this.trackingData[dateStr] === true;
      const isToday = date.toDateString() === today.toDateString();

      if (isTaken) takenCount++;

      const dayEl = document.createElement('div');
      dayEl.className = 'tracking-day';
      if (isTaken) dayEl.classList.add('taken');
      if (isToday) dayEl.classList.add('today');

      const dayNum = date.getDate();
      const monthName = date.toLocaleDateString('bg-BG', { month: 'short' });

      dayEl.innerHTML = `
        <div class="tracking-day-date">${monthName}</div>
        <div class="tracking-day-number">${dayNum}</div>
        ${isTaken ? '<div class="tracking-day-status">✓</div>' : ''}
      `;

      dayEl.addEventListener('click', () => {
        this.toggleDayTracking(dateStr);
      });

      container.appendChild(dayEl);
    });

    // Update stats
    const percentage = Math.round((takenCount / totalDays) * 100);
    const streak = this.calculateStreak();

    statsContainer.innerHTML = `
      <div class="tracking-stat">
        <span class="tracking-stat-value">${takenCount}/${totalDays}</span>
        <span class="tracking-stat-label">Дни с добавки</span>
      </div>
      <div class="tracking-stat">
        <span class="tracking-stat-value">${percentage}%</span>
        <span class="tracking-stat-label">Постоянство</span>
      </div>
      <div class="tracking-stat">
        <span class="tracking-stat-value">${streak}</span>
        <span class="tracking-stat-label">Текуща поредица</span>
      </div>
    `;
  }

  calculateStreak() {
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      if (this.trackingData[dateStr]) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new SupplementTimingApp();

  // Track page view if analytics is available
  if (typeof Analytics !== 'undefined') {
    Analytics.track('page_view', { page: 'supplement_timing' });
  }
});
