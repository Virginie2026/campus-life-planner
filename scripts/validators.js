const titleRegex = /^(?!.*\s{2})\S(?:.*\S)?$/;
const durationRegex = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
const tagRegex = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const duplicateWordRegex = /\b(\w+)\s+\1\b/i;


function isRealDate(text) {
    const d = new Date(text);
    if (isNaN(d)) {
        return false;
    }
    return d.toISOString().slice(0, 10) === text;
}

export function validateField(name, value) {
    if (name === 'title') {
        if (!titleRegex.test(value)) {
            return 'No spaces at the start or end, and no double spaces.';
        }
        if (duplicateWordRegex.test(value)) {
            return 'The title has a repeated word.';
        }

    }

    if (name === 'duration') {
        if (!durationRegex.test(value) || parseFloat(value) <= 0) {
            return 'Enter a number above 0 (max 2 decimals).';

        }

    }
    if (name === 'tag') {
        if (!tagRegex.test(value)) {
            return 'Letters, spaces and hyphens only.';
        }
    }
    if (name === 'startTime') {
        if (!timeRegex.test(value)) {
            return 'Use the format HH:MM, for example 14:30.';
        }
    }
    if (name === 'dueDate') {
        if (!dateRegex.test(value) || !isRealDate(value)) {
            return 'Use a real date as YYYY-MM-DD.';
        }
    }
    return '';
}