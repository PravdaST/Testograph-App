// Lab Testing Application
// Main application logic for lab directory, result interpreter, and progress tracker

class LabTestingApp {
  constructor() {
    this.currentTab = 'directory';
    this.labResults = [];
    this.filteredLabs = [...labsData];
    this.chart = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadLabResults();
    this.renderLabDirectory();
    this.switchTab('directory');
  }

  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Lab directory filters
    document.getElementById('city-filter')?.addEventListener('change', () => {
      this.filterLabs();
    });

    document.getElementById('search-filter')?.addEventListener('input', () => {
      this.filterLabs();
    });

    // Result interpreter
    document.getElementById('interpret-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.interpretResults();
    });

    // Progress tracker
    document.getElementById('add-result-btn')?.addEventListener('click', () => {
      this.showAddResultForm();
    });

    document.getElementById('save-result-btn')?.addEventListener('click', () => {
      this.saveLabResult();
    });

    document.getElementById('cancel-result-btn')?.addEventListener('click', () => {
      this.hideAddResultForm();
    });

    document.getElementById('export-csv-btn')?.addEventListener('click', () => {
      this.exportToCSV();
    });
  }

  switchTab(tabName) {
    this.currentTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
      button.classList.remove('active');
      if (button.dataset.tab === tabName) {
        button.classList.add('active');
      }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`)?.classList.add('active');

    // Load data for specific tabs
    if (tabName === 'tracker') {
      this.renderResultsTable();
      this.renderChart();
    }
  }

  // ========== Lab Directory ==========
  filterLabs() {
    const city = document.getElementById('city-filter').value;
    const search = document.getElementById('search-filter').value.toLowerCase();

    this.filteredLabs = labsData.filter(lab => {
      const cityMatch = !city || lab.city === city;
      const searchMatch = !search ||
        lab.name.toLowerCase().includes(search) ||
        lab.address.toLowerCase().includes(search);
      return cityMatch && searchMatch;
    });

    this.renderLabDirectory();
  }

  renderLabDirectory() {
    const tbody = document.getElementById('labs-table-body');
    if (!tbody) return;

    if (this.filteredLabs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2rem;">
            Няма намерени лаборатории. Опитайте различен филтър.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.filteredLabs.map(lab => `
      <tr>
        <td><strong>${lab.city}</strong></td>
        <td>
          ${lab.name}
          ${lab.no_appointment ? '<span class="lab-badge">Без час</span>' : ''}
        </td>
        <td>${lab.address}</td>
        <td><a href="tel:${lab.phone}" class="lab-link">${lab.phone}</a></td>
        <td>${lab.price_package}</td>
        <td>${lab.hours}</td>
        <td>
          ${lab.website ? `<a href="${lab.website}" target="_blank" class="lab-link">Сайт</a>` : '-'}
        </td>
      </tr>
    `).join('');
  }

  // ========== Result Interpreter ==========
  interpretResults() {
    const age = parseInt(document.getElementById('age-input').value);
    const totalT = parseFloat(document.getElementById('total-t-input').value);
    const freeT = document.getElementById('free-t-input').value ?
      parseFloat(document.getElementById('free-t-input').value) : null;
    const shbg = document.getElementById('shbg-input').value ?
      parseFloat(document.getElementById('shbg-input').value) : null;
    const estradiol = document.getElementById('estradiol-input').value ?
      parseFloat(document.getElementById('estradiol-input').value) : null;

    if (!age || !totalT) {
      alert('Моля въведете възраст и общ тестостерон.');
      return;
    }

    // Determine age range
    let ageRange;
    if (age >= 20 && age < 30) ageRange = "20-30";
    else if (age >= 30 && age < 40) ageRange = "30-40";
    else if (age >= 40 && age < 50) ageRange = "40-50";
    else ageRange = "50+";

    // Reference ranges
    const ranges = {
      "20-30": { optimal: [600, 900], low: 300 },
      "30-40": { optimal: [500, 800], low: 270 },
      "40-50": { optimal: [450, 700], low: 250 },
      "50+": { optimal: [400, 600], low: 230 }
    };

    const range = ranges[ageRange];
    let status, statusClass, recommendation, detailedAdvice;

    if (totalT < range.low) {
      status = "Клинично нисък тестостерон";
      statusClass = "low";
      recommendation = "Вашият тестостерон е под клиничната норма. Препоръчваме консултация с ендокринолог за допълнителни изследвания и възможно лечение.";
      detailedAdvice = `
        <div class="advice-section clinical-low">
          <h4>Съвет:</h4>
          <p>Твоето ниво на тестостерон е клинично ниско. Препоръчваме консултация с ендокринолог за подробно изследване. Това може да се дължи на различни фактори като възраст, стрес, хранене или медицински състояния.</p>
          <p class="medical-disclaimer">⚠️ Това не е медицински съвет. Винаги консултирай лекар.</p>
        </div>
      `;
    } else if (totalT < range.optimal[0]) {
      status = "Под-оптимален тестостерон";
      statusClass = "suboptimal";
      recommendation = "Вашият тестостерон е в нормалния диапазон, но под оптималното ниво. TESTOGRAPH програмата може да помогне за повишаване на нивата чрез естествени методи.";
      detailedAdvice = `
        <div class="advice-section suboptimal">
          <h4>Съвет:</h4>
          <p>Твоето ниво е под оптималното. Животните промени като подобрено хранене (35% мазнини), редовен сън (7-8 часа), силови тренировки и управление на стреса могат значително да помогнат. Протоколът Testograph може да те подкрепи в това.</p>
          <p class="medical-disclaimer">⚠️ Това не е медицински съвет. Винаги консултирай лекар.</p>
        </div>
      `;
    } else if (totalT >= range.optimal[0] && totalT <= range.optimal[1]) {
      status = "Оптимален тестостерон";
      statusClass = "optimal";
      recommendation = "Поздравления! Вашият тестостерон е в оптималния диапазон. Продължете да поддържате здравословните си навици.";
      detailedAdvice = `
        <div class="advice-section optimal">
          <h4>Съвет:</h4>
          <p>Поздравления! Твоето ниво на тестостерон е оптимално. Продължавай да поддържаш добрите си навици - балансирано хранене, редовен сън, физическа активност и управление на стреса.</p>
          <p class="medical-disclaimer">⚠️ Това не е медицински съвет. Винаги консултирай лекар.</p>
        </div>
      `;
    } else {
      status = "Над оптималния диапазон";
      statusClass = "optimal";
      recommendation = "Вашият тестостерон е над очакваното. Това може да е нормално при някои хора, но консултирайте с лекар ако имате притеснения.";
      detailedAdvice = `
        <div class="advice-section high">
          <h4>Съвет:</h4>
          <p>Твоето ниво на тестостерон е над оптималния диапазон. Това може да е нормално при някои хора с активен начин на живот, но ако имаш притеснения, консултирай се с лекар.</p>
          <p class="medical-disclaimer">⚠️ Това не е медицински съвет. Винаги консултирай лекар.</p>
        </div>
      `;
    }

    // Additional insights
    let additionalInfo = [];

    if (freeT) {
      const freeTOptimal = freeT >= 10 && freeT <= 30;
      additionalInfo.push(`Свободен тестостерон: ${freeT} pg/mL ${freeTOptimal ? '✓' : '⚠'}`);
    }

    if (shbg) {
      const shbgOptimal = shbg >= 20 && shbg <= 60;
      additionalInfo.push(`SHBG: ${shbg} nmol/L ${shbgOptimal ? '✓' : '⚠'}`);
      if (shbg > 60) {
        additionalInfo.push('Високо SHBG може да намали свободния тестостерон.');
      }
    }

    if (estradiol) {
      const e2Optimal = estradiol >= 10 && estradiol <= 40;
      additionalInfo.push(`Естрадиол: ${estradiol} pg/mL ${e2Optimal ? '✓' : '⚠'}`);
      if (estradiol > 40) {
        additionalInfo.push('Високо естрадиол може да причини странични ефекти.');
      }
    }

    // Display results
    this.displayInterpretation({
      status,
      statusClass,
      recommendation,
      detailedAdvice,
      totalT,
      freeT,
      shbg,
      estradiol,
      ageRange,
      range,
      additionalInfo
    });

    // Track event
    if (typeof analytics !== 'undefined') {
      analytics.track('lab_result_interpreted', {
        age_range: ageRange,
        total_t: totalT,
        status: statusClass
      });
    }
  }

  displayInterpretation(data) {
    const resultDiv = document.getElementById('interpretation-result');
    if (!resultDiv) return;

    resultDiv.innerHTML = `
      <div class="result-card ${data.statusClass}">
        <div class="result-status">${data.status}</div>
        <p style="margin-top: 0.5rem;">${data.recommendation}</p>

        <div class="result-details">
          <div class="result-item">
            <label>Общ тестостерон</label>
            <div class="value">${data.totalT} ng/dL</div>
          </div>
          <div class="result-item">
            <label>Оптимален диапазон (${data.ageRange} год.)</label>
            <div class="value">${data.range.optimal[0]}-${data.range.optimal[1]} ng/dL</div>
          </div>
          ${data.freeT ? `
            <div class="result-item">
              <label>Свободен тестостерон</label>
              <div class="value">${data.freeT} pg/mL</div>
            </div>
          ` : ''}
          ${data.shbg ? `
            <div class="result-item">
              <label>SHBG</label>
              <div class="value">${data.shbg} nmol/L</div>
            </div>
          ` : ''}
          ${data.estradiol ? `
            <div class="result-item">
              <label>Естрадиол</label>
              <div class="value">${data.estradiol} pg/mL</div>
            </div>
          ` : ''}
        </div>

        ${data.detailedAdvice ? data.detailedAdvice : ''}

        ${data.additionalInfo.length > 0 ? `
          <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.1);">
            <strong>Допълнителна информация:</strong>
            <ul style="margin-top: 0.5rem; margin-left: 1.5rem;">
              ${data.additionalInfo.map(info => `<li>${info}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;

    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ========== Progress Tracker ==========
  async loadLabResults() {
    try {
      // Try to load from Supabase/localStorage
      const stored = localStorage.getItem('lab_results');
      this.labResults = stored ? JSON.parse(stored) : [];
      this.labResults.sort((a, b) => new Date(b.test_date) - new Date(a.test_date));
    } catch (error) {
      console.error('Error loading lab results:', error);
      this.labResults = [];
    }
  }

  showAddResultForm() {
    document.getElementById('result-form-section').style.display = 'block';
    document.getElementById('result-form').reset();
    document.getElementById('result-id').value = '';
  }

  hideAddResultForm() {
    document.getElementById('result-form-section').style.display = 'none';
    document.getElementById('result-form').reset();
  }

  async saveLabResult() {
    const id = document.getElementById('result-id').value;
    const result = {
      test_date: document.getElementById('result-date').value,
      total_t: parseFloat(document.getElementById('result-total-t').value),
      free_t: document.getElementById('result-free-t').value ?
        parseFloat(document.getElementById('result-free-t').value) : null,
      shbg: document.getElementById('result-shbg').value ?
        parseFloat(document.getElementById('result-shbg').value) : null,
      estradiol: document.getElementById('result-estradiol').value ?
        parseFloat(document.getElementById('result-estradiol').value) : null,
      lh: document.getElementById('result-lh').value ?
        parseFloat(document.getElementById('result-lh').value) : null,
      notes: document.getElementById('result-notes').value || ''
    };

    if (!result.test_date || !result.total_t) {
      alert('Моля въведете дата и общ тестостерон.');
      return;
    }

    try {
      if (id) {
        // Update existing
        const index = this.labResults.findIndex(r => r.id === id);
        if (index !== -1) {
          this.labResults[index] = { ...this.labResults[index], ...result };
        }
      } else {
        // Add new
        result.id = Date.now().toString();
        this.labResults.push(result);
      }

      // Sort by date
      this.labResults.sort((a, b) => new Date(b.test_date) - new Date(a.test_date));

      // Save to localStorage
      localStorage.setItem('lab_results', JSON.stringify(this.labResults));

      // Track event
      if (typeof analytics !== 'undefined') {
        analytics.track('lab_result_saved', {
          has_free_t: !!result.free_t,
          has_shbg: !!result.shbg,
          has_estradiol: !!result.estradiol
        });
      }

      this.hideAddResultForm();
      this.renderResultsTable();
      this.renderChart();

      alert('Резултатът е запазен успешно!');
    } catch (error) {
      console.error('Error saving result:', error);
      alert('Грешка при запазване на резултата.');
    }
  }

  editResult(id) {
    const result = this.labResults.find(r => r.id === id);
    if (!result) return;

    document.getElementById('result-id').value = result.id;
    document.getElementById('result-date').value = result.test_date;
    document.getElementById('result-total-t').value = result.total_t;
    document.getElementById('result-free-t').value = result.free_t || '';
    document.getElementById('result-shbg').value = result.shbg || '';
    document.getElementById('result-estradiol').value = result.estradiol || '';
    document.getElementById('result-lh').value = result.lh || '';
    document.getElementById('result-notes').value = result.notes || '';

    this.showAddResultForm();
  }

  deleteResult(id) {
    if (!confirm('Сигурни ли сте, че искате да изтриете този резултат?')) {
      return;
    }

    this.labResults = this.labResults.filter(r => r.id !== id);
    localStorage.setItem('lab_results', JSON.stringify(this.labResults));

    this.renderResultsTable();
    this.renderChart();
  }

  renderResultsTable() {
    const tbody = document.getElementById('results-table-body');
    if (!tbody) return;

    if (this.labResults.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            <p>Все още нямате добавени резултати.</p>
            <p style="margin-top: 0.5rem;">Кликнете "Добави резултат" за да започнете проследяване.</p>
          </td>
        </tr>
      `;
      document.getElementById('tracker-stats').style.display = 'none';
      return;
    }

    tbody.innerHTML = this.labResults.map(result => `
      <tr>
        <td>${new Date(result.test_date).toLocaleDateString('bg-BG')}</td>
        <td><strong>${result.total_t}</strong></td>
        <td>${result.free_t || '-'}</td>
        <td>${result.shbg || '-'}</td>
        <td>${result.estradiol || '-'}</td>
        <td>${result.notes || '-'}</td>
        <td class="actions">
          <button class="btn btn-sm btn-secondary" onclick="app.editResult('${result.id}')">✏️</button>
          <button class="btn btn-sm btn-secondary" onclick="app.deleteResult('${result.id}')">🗑️</button>
        </td>
      </tr>
    `).join('');

    this.renderStats();
  }

  renderStats() {
    const statsDiv = document.getElementById('tracker-stats');
    if (!statsDiv || this.labResults.length < 2) {
      if (statsDiv) statsDiv.style.display = 'none';
      return;
    }

    statsDiv.style.display = 'block';

    const firstResult = this.labResults[this.labResults.length - 1];
    const lastResult = this.labResults[0];
    const improvement = lastResult.total_t - firstResult.total_t;
    const improvementPercent = ((improvement / firstResult.total_t) * 100).toFixed(1);

    statsDiv.innerHTML = `
      <div class="card">
        <h3>Напредък</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
          <div>
            <label style="display: block; color: var(--text-secondary); font-size: 0.875rem;">Първо измерване</label>
            <div style="font-size: 1.5rem; font-weight: 600;">${firstResult.total_t} ng/dL</div>
            <div style="font-size: 0.875rem; color: var(--text-secondary);">${new Date(firstResult.test_date).toLocaleDateString('bg-BG')}</div>
          </div>
          <div>
            <label style="display: block; color: var(--text-secondary); font-size: 0.875rem;">Последно измерване</label>
            <div style="font-size: 1.5rem; font-weight: 600;">${lastResult.total_t} ng/dL</div>
            <div style="font-size: 0.875rem; color: var(--text-secondary);">${new Date(lastResult.test_date).toLocaleDateString('bg-BG')}</div>
          </div>
          <div>
            <label style="display: block; color: var(--text-secondary); font-size: 0.875rem;">Промяна</label>
            <div class="improvement-badge ${improvement >= 0 ? 'positive' : 'negative'}">
              ${improvement >= 0 ? '+' : ''}${improvement.toFixed(0)} ng/dL (${improvementPercent}%)
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderChart() {
    const canvas = document.getElementById('progress-chart');
    if (!canvas || this.labResults.length === 0) return;

    // Destroy existing chart
    if (this.chart) {
      this.chart.destroy();
    }

    const sortedResults = [...this.labResults].reverse(); // Chronological order

    const ctx = canvas.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: sortedResults.map(r => new Date(r.test_date).toLocaleDateString('bg-BG')),
        datasets: [{
          label: 'Общ тестостерон (ng/dL)',
          data: sortedResults.map(r => r.total_t),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          tension: 0.3,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'ng/dL'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Дата'
            }
          }
        }
      }
    });
  }

  exportToCSV() {
    if (this.labResults.length === 0) {
      alert('Няма резултати за експортиране.');
      return;
    }

    const headers = ['Дата', 'Общ T (ng/dL)', 'Свободен T (pg/mL)', 'SHBG (nmol/L)', 'Естрадиол (pg/mL)', 'LH (mIU/mL)', 'Бележки'];
    const rows = this.labResults.map(r => [
      r.test_date,
      r.total_t,
      r.free_t || '',
      r.shbg || '',
      r.estradiol || '',
      r.lh || '',
      r.notes || ''
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `testograph-results-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (typeof analytics !== 'undefined') {
      analytics.track('lab_results_exported', { format: 'csv', count: this.labResults.length });
    }
  }

}

// Initialize app when DOM is ready
let app;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app = new LabTestingApp();
  });
} else {
  app = new LabTestingApp();
}
