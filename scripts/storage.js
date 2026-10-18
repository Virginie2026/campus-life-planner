const RECORDS_KEY = 'campus_records';
const SETTINGS_KEY = 'campus_settings';

export function loadRecords() {
  try {
    const data = JSON.parse(localStorage.getItem(RECORDS_KEY));
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    return [];
  }

}

export function saveRecords(records) {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function loadSettings() {
  try {
    const data = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    return data || { unit: 'min', cap: '' };
  } catch (error) {
    return { unit: 'min', cap: '' };

  }

}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

}

export function isValidImport(data) {
  if (!Array.isArray(data)) {
    return false;
  }
  for (const item of data) {
    if (typeof item.id !== 'string') return false;
    if (typeof item.title !== 'string') return false;
    if (typeof item.duration !== 'number') return false;
    if (typeof item.tag !== 'string') return false;
    if (typeof item.startTime !== 'string') return false;
    if (typeof item.dueDate !== 'string') return false;

  }
  return true;
}