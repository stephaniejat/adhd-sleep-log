import { App, Modal, Notice, Plugin } from "obsidian";

export default class SleepLogPlugin extends Plugin {
  async onload() {
    this.addRibbonIcon("bed", "ADHD Sleep Log", () => new SleepLogModal(this.app).open());
  }
}

class SleepLogModal extends Modal {
  constructor(app: App) { super(app); }

  formatDate(isoDate: string): string {
    const [year, month, day] = isoDate.split('-');
    return `${day}-${month}-${year}`;
  }

  parseTime(timeStr: string): string {
    if (!timeStr) return "0h 0m";
    const [hours, mins] = timeStr.split(':');
    return `${hours}h ${mins}m`;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.addClass('sleep-log-modal');

    // Date picker FIRST
    const dateRow = contentEl.createEl('p');
    dateRow.createEl('label', { text: 'Sleep date:' });
    const dateInput = dateRow.createEl('input', { attr: { id: 'sleep_date', type: 'date' } });
    dateInput.value = new Date().toISOString().split('T')[0];
    dateRow.createEl('small', { text: '(DD-MM-YYYY)' }).style.color = 'gray';

    contentEl.createEl('h3', { text: 'ADHD Sleep Log' });
    contentEl.createEl('p', { text: `File: ${this.app.workspace.getActiveFile()?.basename || 'Today'}` });

    // SINGLE time input
    const timeRow = contentEl.createEl('p');
    timeRow.createEl('label', { text: 'Total sleep:' });
    const timeInput = timeRow.createEl('input', { attr: { id: 'total_sleep_time', type: 'time' } });
    timeInput.value = '07:00';

    // Rest of fields (unchanged)
    const fields = [
      { id: 'deep_sleep_min', label: 'Deep sleep (min):', type: 'number' },
      { id: 'light_sleep_min', label: 'Light sleep (min):', type: 'number' },
      { id: 'rem_sleep_min', label: 'REM sleep (min):', type: 'number' },
      { id: 'awake_min', label: 'Awake time (min):', type: 'number' },
      { id: 'restless_moments', label: 'Restless moments:', type: 'number' },
      { id: 'energy', label: 'Energy (1-5):', type: 'number', min: '1', max: '5' }
    ];
    fields.forEach(field => {
      const row = contentEl.createEl('p');
      row.createEl('label', { text: field.label });
      row.createEl('input', { attr: { id: field.id, type: field.type, ...(field.min && {min: field.min}), ...(field.max && {max: field.max}) } });
    });

    // Dropdowns
    const crashRow = contentEl.createEl('p'); crashRow.createEl('label', { text: 'Crash-day?' });
    const crashSelect = crashRow.createEl('select', { attr: { id: 'crash_day' } });
    ['no', 'yes'].forEach(val => { const opt = crashSelect.createEl('option', { text: val, attr: { value: val } }); if (val === 'no') opt.selected = true; });

    const dexRow = contentEl.createEl('p'); dexRow.createEl('label', { text: 'Dexamfetamine:' });
    const dexSelect = dexRow.createEl('select', { attr: { id: 'dexamfetamine' } });
    ['none', 'am', 'pm'].forEach(val => { const opt = dexSelect.createEl('option', { text: val, attr: { value: val } }); if (val === 'am') opt.selected = true; });

    // Save
    const saveBtn = contentEl.createEl('button', { text: 'Log to file', attr: { id: 'save_sleep_btn' } });
    saveBtn.style.marginTop = '10px'; saveBtn.style.padding = '8px 16px';
    saveBtn.onclick = async () => {
      const getVal = (id: string): string => (this.contentEl.querySelector(`#${id}`) as HTMLInputElement)?.value || '0';
      const getSel = (id: string): string => (this.contentEl.querySelector(`#${id}`) as HTMLSelectElement)?.value || '';
      const sleepDateISO = getVal('sleep_date');
      const timeStr = getVal('total_sleep_time');
      const today = new Date().toISOString().split('T')[0];

      const totalSleep = this.parseTime(timeStr);
      const sleepDateDisplay = sleepDateISO ? this.formatDate(sleepDateISO) : this.formatDate(today);

      const content = `---
sleep_date: ${sleepDateDisplay} (${sleepDateISO || today})
total_sleep: ${totalSleep}
deep_sleep_min: ${getVal('deep_sleep_min')}
light_sleep_min: ${getVal('light_sleep_min')}
rem_sleep_min: ${getVal('rem_sleep_min')}
awake_min: ${getVal('awake_min')}
restless_moments: ${getVal('restless_moments')}
next_day_energy_1-5: ${getVal('energy')}
crash_day: ${getSel('crash_day')}
dexamfetamine: ${getSel('dexamfetamine')}
med_notes:

# Sleep Log (ADHD-style)
Date: ${sleepDateDisplay} | Sleep: ${totalSleep}
- Deep: ${getVal('deep_sleep_min')} min | Light: ${getVal('light_sleep_min')} | REM: ${getVal('rem_sleep_min')} | Awake: ${getVal('awake_min')}
- Restless: ${getVal('restless_moments')} | Energy: ${getVal('energy')}/5 | Crash: ${getSel('crash_day')} | Dex: ${getSel('dexamfetamine')}
`;

      const activeFile = this.app.workspace.getActiveFile();
      if (activeFile) {
        await this.app.vault.append(activeFile, '\\n\\n' + content);
        new Notice(`Sleep logged for ${sleepDateDisplay}!`, 2000);
        this.close();
      }
    };
  }

  onClose() {
    this.contentEl.empty();
  }
}
