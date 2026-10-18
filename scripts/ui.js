import { highlight } from './search.js';

export function formatDuration(minutes, unit) {
  if (unit === 'h') {
    return (minutes / 60).toFixed(2) + ' h';

  }
  return minutes + ' min';
}
export function renderTable(list, re, unit) {
  const body = document.getElementById('table-body');
  body.innerHTML = '';

  if (list.length === 0) {
    body.innerHTML = '<tr><td colspan="6">No tasks found.</td></tr>';
    return;

  }

  for (const r of list) {
    const row = document.createElement('tr');
    row.innerHTML =
      '<td>' + highlight(r.startTime, re) + '</td>' +
      '<td>' + highlight(r.title, re) + '</td>' +
      '<td>' + highlight(r.tag, re) + '</td>' +
      '<td>' + formatDuration(r.duration, unit) + '</td>' +
      '<td>' + highlight(r.dueDate, re) + '</td>' +
      '<td>' +
      '<button type="button" data-action="edit" data-id="' + r.id + '">Edit</button> ' +
      '<button type="button" data-action="delete" data-id="' + r.id + '">Delete</button> ' +
      '</td>';
    body.appendChild(row);

  }


}
function findTopTag(records) {
  const counts = {};
  let top = '-';
  let max = 0;
  for (const r of records) {
    counts[r.tag] = (counts[r.tag] || 0) + 1;
    if (counts[r.tag] > max) {
      max = counts[r.tag];
      top = r.tag;
    }
  }
  return top;
}
function renderTrend(records) {
  const chart = document.getElementById('trend-chart');
  chart.innerHTML = '';

  const totals = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const dayText = day.toISOString().slice(0, 10);

    let sum = 0;
    for (const r of records) {
      if (r.dueDate === dayText) {
        sum += r.duration;
      }

    }
    totals.push(sum);
  }

  const biggest = Math.max(...totals, 1);
  for (const total of totals) {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = (total / biggest) * 100 + '%';
    bar.title = total + ' min';
    chart.appendChild(bar);
  }

}

function renderCap(totalMinutes, cap) {
  const message = document.getElementById('cap-message');
  message.className = '';

  if (cap === '' || isNaN(cap)) {
    message.textContent = '';
    return;
  }

  const difference = Number(cap) - totalMinutes;
  if (difference >= 0) {
    message.setAttribute('aria-live', 'polite');
    message.textContent = difference + ' minutes remaining.';
  } else {
    message.setAttribute('aria-live', 'assertive');
    message.className = 'over';
    message.textContent = 'Cap exceeded by ' + Math.abs(difference) + ' minutes!';

  }

}

export function renderStats(records, cap, unit) {
  let total = 0;
  for (const r of records) {
    total += r.duration;
  }
  document.getElementById('total-count').textContent = records.length;
  document.getElementById('total-duration').textContent = formatDuration(total, unit);
  document.getElementById('top-tag').textContent = findTopTag(records);

  renderTrend(records);
  renderCap(total, cap);

}