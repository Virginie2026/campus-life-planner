

export function compileRegex(input, ignoreCase) {
     if (input === '') {
          return null;

     }
     try {
          return new RegExp(input, ignoreCase ? 'i' : '');
     } catch (error) {
          return null;
     }
}

function escapeHTML(text) {
     return String(text)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
}
export function highlight(text, re) {
     text = String(text);
     if (!re) {
          return escapeHTML(text);

     }
     const globalRe = new RegExp(re.source, re.flags + 'g');
     let result = '';
     let last = 0;
     let match;
     while ((match = globalRe.exec(text)) !== null) {
          if (match[0] === '') {
               globalRe.lastIndex++;
               continue;

          }
          result += escapeHTML(text.slice(last, match.index));
          result += '<mark>' + escapeHTML(match[0]) + '</mark>';
          last = match.index + match[0].length;

     }
     result += escapeHTML(text.slice(last));
     return result;

}
export function filterRecords(records, re) {
     if (!re) {
          return records;
     }
     return records.filter(function (r) {
          return re.test(r.title) || re.test(r.tag) || re.test(r.dueDate);
     });
}

export function sortRecords(records, choice) {
     const parts = choice.split('-');
     const field = parts[0];
     const direction = parts[1];
     const list = records.slice();

     list.sort(function (a, b) {
          let result = 0;
          if (field === 'date') {
               result = a.dueDate.localeCompare(b.dueDate);
          }
          if (field === 'title') {
               result = a.title.localeCompare(b.title);

          }
          if (field === 'duration') {
               result = a.duration - b.duration;
          }
          if (direction === 'desc') {
               result = -result;
          }
          return result;
     });
     return list;


}