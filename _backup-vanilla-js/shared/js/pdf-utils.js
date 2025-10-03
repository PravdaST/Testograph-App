// PDF Generation Utility using jsPDF
const PDFUtils = {
  // Check if jsPDF is loaded
  isLibraryLoaded() {
    return typeof window.jspdf !== 'undefined';
  },

  // Load jsPDF library dynamically
  async loadLibrary() {
    if (this.isLibraryLoaded()) {
      return true;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load jsPDF'));
      document.head.appendChild(script);
    });
  },

  // Create a new PDF document
  async createPDF(orientation = 'portrait', unit = 'mm', format = 'a4') {
    await this.loadLibrary();
    const { jsPDF } = window.jspdf;
    return new jsPDF(orientation, unit, format);
  },

  // Generate exercise poster PDF
  async generateExercisePoster(exercises, options = {}) {
    const doc = await this.createPDF('portrait', 'mm', 'a4');

    const {
      title = 'Exercise Guide',
      fontSize = 10,
      lineHeight = 6,
      margin = 15
    } = options;

    let y = margin;
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const contentWidth = pageWidth - (margin * 2);

    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(title, margin, y);
    y += 12;

    // Subtitle
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`${exercises.length} Exercises for Maximum Testosterone`, margin, y);
    y += 10;

    // Draw line
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Exercises
    doc.setFontSize(fontSize);

    exercises.forEach((exercise, index) => {
      // Check if we need a new page
      if (y > pageHeight - 40) {
        doc.addPage();
        y = margin;
      }

      // Exercise number and name
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${exercise.name}`, margin, y);
      y += lineHeight;

      // Category and T-Boost
      doc.setFont(undefined, 'normal');
      doc.text(`   Category: ${exercise.category} | T-Boost: ${exercise.testosterone_benefit}`, margin, y);
      y += lineHeight;

      // Sets and Reps
      doc.text(`   Protocol: ${exercise.sets} sets × ${exercise.reps} reps | Rest: ${exercise.rest}`, margin, y);
      y += lineHeight;

      // Form cues (first 3)
      doc.setFont(undefined, 'italic');
      const formCues = exercise.form.slice(0, 3);
      formCues.forEach(cue => {
        // Word wrap for long text
        const lines = doc.splitTextToSize(`   ✓ ${cue}`, contentWidth - 5);
        lines.forEach(line => {
          if (y > pageHeight - 20) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += lineHeight;
        });
      });

      y += 3; // Space between exercises
    });

    // Footer
    const timestamp = new Date().toLocaleDateString('bg-BG');
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${timestamp}`, margin, pageHeight - 10);

    return doc;
  },

  // Download PDF
  downloadPDF(doc, filename = 'document.pdf') {
    doc.save(filename);
  },

  // Open PDF in new tab
  openPDF(doc) {
    window.open(doc.output('bloburl'), '_blank');
  },

  // Generate Sleep Protocol PDF
  async generateSleepProtocol(routine, checklist, options = {}) {
    const doc = await this.createPDF('portrait', 'mm', 'a4');

    const {
      fontSize = 10,
      lineHeight = 6,
      margin = 15
    } = options;

    let y = margin;
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const contentWidth = pageWidth - (margin * 2);

    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Your Personalized Sleep Protocol', margin, y);
    y += 12;

    // Date
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const timestamp = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Generated: ${timestamp}`, margin, y);
    y += 10;

    // Draw line
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Evening Routine Section
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Your Evening Routine', margin, y);
    y += 10;

    doc.setFontSize(fontSize);
    doc.setFont(undefined, 'normal');

    // Bedtime info
    doc.text(`Target Bedtime: ${routine.bedtime}`, margin, y);
    y += lineHeight + 2;

    // Timeline
    routine.timeline.forEach(item => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = margin;
      }

      doc.setFont(undefined, 'bold');
      doc.text(item.time, margin, y);

      doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(item.activity, contentWidth - 30);
      lines.forEach((line, idx) => {
        doc.text(line, margin + 30, y + (idx * lineHeight));
      });

      y += (Math.max(1, lines.length) * lineHeight) + 3;
    });

    y += 5;

    // Bedroom Optimization Checklist
    if (y > pageHeight - 60) {
      doc.addPage();
      y = margin;
    }

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Bedroom Optimization Checklist', margin, y);
    y += 10;

    doc.setFontSize(fontSize);

    checklist.forEach(item => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = margin;
      }

      // Checkbox
      doc.rect(margin, y - 3, 4, 4);
      if (item.checked) {
        doc.text('✓', margin + 1, y);
      }

      // Item text
      doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(item.text, contentWidth - 10);
      lines.forEach((line, idx) => {
        doc.text(line, margin + 8, y + (idx * lineHeight));
      });

      y += (Math.max(1, lines.length) * lineHeight) + 2;
    });

    // Footer
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.text('Consistency is key. Follow this routine for at least 2 weeks to see results.', margin, pageHeight - 10);

    return doc;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PDFUtils;
}
