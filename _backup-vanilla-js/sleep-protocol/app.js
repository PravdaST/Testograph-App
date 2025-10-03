// Sleep Protocol Application
class SleepProtocolApp {
  constructor() {
    this.currentSection = 1;
    this.assessmentData = {};
    this.routineData = {};
    this.checklistItems = [];
    this.sleepLogs = [];
    this.chart = null;

    this.init();
  }

  init() {
    // Check user authentication
    this.checkAuth();

    // Load saved data
    this.loadFromStorage();

    // Initialize checklist items
    this.initializeChecklist();

    // Set up event listeners
    this.setupEventListeners();

    // Set default log date to today
    document.getElementById('log-date').valueAsDate = new Date();

    // Load sleep logs and render
    this.loadSleepLogs();

    // Initialize chart
    this.initializeChart();

    // Track page view
    Analytics.track('page_view', { page: 'sleep_protocol' });
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

      // Try to sync data from Supabase
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
    // Try to load data from Supabase if available
    if (typeof supabase === 'undefined') return;

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      // Load sleep logs from Supabase
      const { data: sleepLogs } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (sleepLogs && sleepLogs.length > 0) {
        this.sleepLogs = sleepLogs;
        this.saveSleepLogs();
        this.renderSleepLogs();
        this.updateStatistics();
        if (this.chart) this.updateChart();
      }

      // Load assessment and routine from Supabase
      const { data: protocols } = await supabase
        .from('sleep_protocols')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (protocols && protocols.length > 0) {
        const protocol = protocols[0];
        this.assessmentData = protocol.assessment_data;
        this.routineData = protocol.routine_data;
        localStorage.setItem('sleep_assessment', JSON.stringify(this.assessmentData));
        localStorage.setItem('sleep_routine', JSON.stringify(this.routineData));
        if (this.routineData) this.renderRoutine();
      }

    } catch (error) {
      console.log('Could not sync from profile:', error);
    }
  }

  setupEventListeners() {
    // Assessment form submission
    const assessmentForm = document.getElementById('assessment-form');
    assessmentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAssessmentSubmit();
    });

    // Sleep log form submission
    const logForm = document.getElementById('sleep-log-form');
    logForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSleepLogSubmit();
    });

    // Quality slider update
    const qualitySlider = document.getElementById('log-quality');
    qualitySlider.addEventListener('input', (e) => {
      document.getElementById('quality-display').textContent = e.target.value;
    });
  }

  initializeChecklist() {
    this.checklistItems = [
      {
        id: 1,
        title: 'Инсталирай плътни завеси или щори',
        description: 'Пълната тъмнина е от съществено значение за оптималната продукция на мелатонин.',
        checked: false
      },
      {
        id: 2,
        title: 'Постави температурата в спалнята на 18-20°C',
        description: 'Хладната температура насърчава по-добро качество на съня.',
        checked: false
      },
      {
        id: 3,
        title: 'Премахни всички LED светлини и електроника',
        description: 'Покрий или премахни всички устройства, излъчващи светлина, включително будилници.',
        checked: false
      },
      {
        id: 4,
        title: 'Дръж телефона извън спалнята',
        description: 'Или поне го постави от другата страна на стаята в самолетен режим.',
        checked: false
      },
      {
        id: 5,
        title: 'Инвестирай в удобен, поддържащ матрак',
        description: 'Сменяй матрака си на всеки 7-10 години за оптимална поддръжка.',
        checked: false
      },
      {
        id: 6,
        title: 'Използвай дишащи, естествени спални материали',
        description: 'Памучни, ленени или бамбукови чаршафи помагат за регулиране на температурата.',
        checked: false
      },
      {
        id: 7,
        title: 'Инсталирай машина за бял шум или вентилатор',
        description: 'Постоянният фонов шум маскира смущаващите звуци.',
        checked: false
      },
      {
        id: 8,
        title: 'Премахни безпорядъка и създай спокойна среда',
        description: 'Подредената спалня насърчава психическата релаксация.',
        checked: false
      },
      {
        id: 9,
        title: 'Използвай маска за очи, ако пълната тъмнина не е възможна',
        description: 'Гарантира, че никаква светлина не достига до очите ти по време на сън.',
        checked: false
      },
      {
        id: 10,
        title: 'Обмисли качеството на въздуха с растения или пречиствател',
        description: 'Чистият въздух подобрява дишането и качеството на съня.',
        checked: false
      }
    ];

    // Load saved checklist state
    const saved = localStorage.getItem('sleep_checklist');
    if (saved) {
      const savedChecklist = JSON.parse(saved);
      this.checklistItems.forEach(item => {
        const savedItem = savedChecklist.find(s => s.id === item.id);
        if (savedItem) {
          item.checked = savedItem.checked;
        }
      });
    }

    this.renderChecklist();
  }

  handleAssessmentSubmit() {
    // Collect form data
    this.assessmentData = {
      sleepHours: parseFloat(document.getElementById('sleep-hours').value),
      bedtime: document.getElementById('bedtime').value,
      fallAsleepTime: document.getElementById('fall-asleep-time').value,
      wakeUps: document.getElementById('wake-ups').value
    };

    // Save to storage
    localStorage.setItem('sleep_assessment', JSON.stringify(this.assessmentData));

    // Generate routine
    this.generateRoutine();

    // Track event
    Analytics.track('assessment_completed', this.assessmentData);

    // Move to next section
    this.goToSection(2);
  }

  generateRoutine() {
    const bedtime = this.assessmentData.bedtime;
    const [hours, minutes] = bedtime.split(':').map(Number);

    // Calculate routine times
    const bedtimeDate = new Date();
    bedtimeDate.setHours(hours, minutes, 0);

    const timeline = [
      {
        time: this.formatTime(new Date(bedtimeDate.getTime() - 120 * 60000)),
        activity: 'Спри всички екрани',
        description: 'Изключи телефони, компютри, таблети и телевизия. Синята светлина потиска производството на мелатонин.'
      },
      {
        time: this.formatTime(new Date(bedtimeDate.getTime() - 90 * 60000)),
        activity: 'Вземи Мелатонин 5mg + Магнезий 400mg',
        description: 'Добавките работят най-добре, когато се приемат 1.5 часа преди сън. Вземи с малко вода.'
      },
      {
        time: this.formatTime(new Date(bedtimeDate.getTime() - 70 * 60000)),
        activity: 'Леко разтягане или нежна йога',
        description: '10-15 минути леко движение помага за освобождаване на мускулното напрежение.'
      },
      {
        time: this.formatTime(new Date(bedtimeDate.getTime() - 60 * 60000)),
        activity: 'Вземи топъл душ или вана',
        description: 'Спадането на телесната температура след топъл душ сигнализира на тялото ти време за сън.'
      },
      {
        time: this.formatTime(new Date(bedtimeDate.getTime() - 30 * 60000)),
        activity: 'Четене или медитация',
        description: 'Избери успокояващи дейности. Избягвай стимулиращо съдържание. Използвай приглушена, топла светлина.'
      },
      {
        time: this.formatTime(new Date(bedtimeDate.getTime() - 15 * 60000)),
        activity: 'Подготви спалната среда',
        description: 'Увери се, че стаята е хладна, тъмна и тиха. Постави температурата на 18-20°C.'
      },
      {
        time: bedtime,
        activity: 'Изгаси светлините - Време за сън',
        description: 'Лягни в леглото и практикувай дълбоко дишане или прогресивна мускулна релаксация.'
      }
    ];

    this.routineData = {
      bedtime: bedtime,
      routineStart: this.formatTime(new Date(bedtimeDate.getTime() - 120 * 60000)),
      timeline: timeline
    };

    // Save to storage
    localStorage.setItem('sleep_routine', JSON.stringify(this.routineData));

    // Render routine
    this.renderRoutine();
  }

  renderRoutine() {
    // Update summary cards
    document.getElementById('target-bedtime').textContent = this.routineData.bedtime;
    document.getElementById('routine-start').textContent = this.routineData.routineStart;

    // Render timeline
    const timelineContainer = document.getElementById('routine-timeline');
    timelineContainer.innerHTML = '';

    this.routineData.timeline.forEach(item => {
      const timelineItem = document.createElement('div');
      timelineItem.className = 'timeline-item';
      timelineItem.innerHTML = `
        <div class="timeline-time">${item.time}</div>
        <div class="timeline-activity">${item.activity}</div>
        <div class="timeline-description">${item.description}</div>
      `;
      timelineContainer.appendChild(timelineItem);
    });
  }

  renderChecklist() {
    const checklistContainer = document.getElementById('checklist-items');
    checklistContainer.innerHTML = '';

    this.checklistItems.forEach(item => {
      const checklistItem = document.createElement('div');
      checklistItem.className = `checklist-item ${item.checked ? 'checked' : ''}`;
      checklistItem.innerHTML = `
        <div class="checklist-checkbox"></div>
        <div class="checklist-content">
          <div class="checklist-title">${item.title}</div>
          <div class="checklist-description">${item.description}</div>
        </div>
      `;

      checklistItem.addEventListener('click', () => {
        item.checked = !item.checked;
        this.saveChecklist();
        this.renderChecklist();
        Analytics.track('checklist_item_toggled', {
          item_id: item.id,
          checked: item.checked
        });
      });

      checklistContainer.appendChild(checklistItem);
    });

    this.updateChecklistProgress();
  }

  updateChecklistProgress() {
    const completed = this.checklistItems.filter(item => item.checked).length;
    const total = this.checklistItems.length;
    const percentage = (completed / total) * 100;

    document.getElementById('checklist-progress').style.width = `${percentage}%`;
    document.getElementById('checklist-completed').textContent = completed;
    document.getElementById('checklist-total').textContent = total;
  }

  saveChecklist() {
    localStorage.setItem('sleep_checklist', JSON.stringify(this.checklistItems));
  }

  async handleSleepLogSubmit() {
    const date = document.getElementById('log-date').value;
    const bedtime = document.getElementById('log-bedtime').value;
    const waketime = document.getElementById('log-waketime').value;
    const quality = parseInt(document.getElementById('log-quality').value);

    // Calculate sleep hours
    const sleepHours = this.calculateSleepHours(bedtime, waketime);

    const userId = localStorage.getItem('userId');

    const logEntry = {
      id: Date.now(),
      date: date,
      bedtime: bedtime,
      waketime: waketime,
      quality: quality,
      hours: sleepHours,
      created_at: new Date().toISOString(),
      user_id: userId || 'guest'
    };

    // Add to logs array
    this.sleepLogs.unshift(logEntry);

    // Save to localStorage
    this.saveSleepLogs();

    // Try to save to Supabase if user is logged in
    if (userId && typeof supabase !== 'undefined') {
      try {
        const { error } = await supabase
          .from('sleep_logs')
          .insert([logEntry]);

        if (error) throw error;
        this.showNotification('Записът е запазен в профила ти!');
      } catch (error) {
        console.log('Could not save to Supabase:', error);
        this.showNotification('Записът е запазен локално');
      }
    } else {
      this.showNotification('Записът е запазен локално');
    }

    // Track event
    Analytics.track('sleep_log_added', {
      quality: quality,
      hours: sleepHours
    });

    // Update UI
    this.renderSleepLogs();
    this.updateStatistics();
    this.updateChart();

    // Reset form
    document.getElementById('sleep-log-form').reset();
    document.getElementById('log-date').valueAsDate = new Date();
    document.getElementById('quality-display').textContent = '7';
  }

  calculateSleepHours(bedtime, waketime) {
    const [bedHours, bedMinutes] = bedtime.split(':').map(Number);
    const [wakeHours, wakeMinutes] = waketime.split(':').map(Number);

    let bedDate = new Date();
    bedDate.setHours(bedHours, bedMinutes, 0);

    let wakeDate = new Date();
    wakeDate.setHours(wakeHours, wakeMinutes, 0);

    // If wake time is earlier than bedtime, it's the next day
    if (wakeDate <= bedDate) {
      wakeDate.setDate(wakeDate.getDate() + 1);
    }

    const diffMs = wakeDate - bedDate;
    const hours = diffMs / (1000 * 60 * 60);

    return parseFloat(hours.toFixed(1));
  }

  renderSleepLogs() {
    const logsContainer = document.getElementById('sleep-logs-list');

    if (this.sleepLogs.length === 0) {
      logsContainer.innerHTML = '<p class="empty-state">Все още няма записи. Започни да записваш, за да видиш историята си!</p>';
      return;
    }

    logsContainer.innerHTML = '';

    // Show last 10 logs
    const recentLogs = this.sleepLogs.slice(0, 10);

    recentLogs.forEach(log => {
      const logEntry = document.createElement('div');
      logEntry.className = 'log-entry';
      logEntry.innerHTML = `
        <div>
          <div class="log-date">${this.formatDate(log.date)}</div>
          <div class="log-details">${log.bedtime} - ${log.waketime} (${log.hours}h)</div>
        </div>
        <div class="log-quality">${log.quality}/10</div>
      `;
      logsContainer.appendChild(logEntry);
    });
  }

  updateStatistics() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filter logs
    const last7Days = this.sleepLogs.filter(log => new Date(log.date) >= sevenDaysAgo);
    const last30Days = this.sleepLogs.filter(log => new Date(log.date) >= thirtyDaysAgo);

    // Calculate averages
    const avg7Quality = this.calculateAverage(last7Days, 'quality');
    const avg7Hours = this.calculateAverage(last7Days, 'hours');
    const avg30Quality = this.calculateAverage(last30Days, 'quality');
    const avg30Hours = this.calculateAverage(last30Days, 'hours');

    // Update UI
    document.getElementById('avg-quality-7').textContent = avg7Quality;
    document.getElementById('avg-hours-7').textContent = avg7Hours;
    document.getElementById('avg-quality-30').textContent = avg30Quality;
    document.getElementById('avg-hours-30').textContent = avg30Hours;
  }

  calculateAverage(logs, field) {
    if (logs.length === 0) return '-';

    const sum = logs.reduce((acc, log) => acc + log[field], 0);
    const avg = sum / logs.length;

    return field === 'quality' ? avg.toFixed(1) : `${avg.toFixed(1)}h`;
  }

  initializeChart() {
    const ctx = document.getElementById('sleep-chart').getContext('2d');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Sleep Quality',
          data: [],
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: function(context) {
                return `Quality: ${context.parsed.y}/10`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            ticks: {
              stepSize: 2
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });

    this.updateChart();
  }

  updateChart() {
    if (!this.chart) return;

    // Get last 7 days of logs
    const chartData = this.sleepLogs
      .slice(0, 7)
      .reverse()
      .map(log => ({
        date: this.formatDate(log.date),
        quality: log.quality
      }));

    this.chart.data.labels = chartData.map(d => d.date);
    this.chart.data.datasets[0].data = chartData.map(d => d.quality);
    this.chart.update();
  }

  loadSleepLogs() {
    const saved = localStorage.getItem('sleep_logs');
    if (saved) {
      this.sleepLogs = JSON.parse(saved);
      this.renderSleepLogs();
      this.updateStatistics();
      if (this.chart) {
        this.updateChart();
      }
    }
  }

  saveSleepLogs() {
    localStorage.setItem('sleep_logs', JSON.stringify(this.sleepLogs));
  }


  goToSection(sectionNumber) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('active');
    });

    // Show target section
    const sections = ['assessment', 'routine', 'checklist', 'tracker'];
    document.getElementById(`section-${sections[sectionNumber - 1]}`).classList.add('active');

    // Update progress indicator
    document.querySelectorAll('.step-number').forEach((step, index) => {
      step.classList.remove('active', 'completed');
      if (index + 1 < sectionNumber) {
        step.classList.add('completed');
      } else if (index + 1 === sectionNumber) {
        step.classList.add('active');
      }
    });

    this.currentSection = sectionNumber;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Track section view
    Analytics.track('section_viewed', { section: sections[sectionNumber - 1] });
  }

  loadFromStorage() {
    const assessment = localStorage.getItem('sleep_assessment');
    if (assessment) {
      this.assessmentData = JSON.parse(assessment);
      // Populate form
      Object.keys(this.assessmentData).forEach(key => {
        const element = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
        if (element) {
          element.value = this.assessmentData[key];
        }
      });
    }

    const routine = localStorage.getItem('sleep_routine');
    if (routine) {
      this.routineData = JSON.parse(routine);
      this.renderRoutine();
    }
  }

  formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background-color: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#ef4444'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Add notification animations to document
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize app when DOM is ready
let app;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app = new SleepProtocolApp();
  });
} else {
  app = new SleepProtocolApp();
}
