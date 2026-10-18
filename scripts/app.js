import  { loadRecords, saveRecords, loadSettings, saveSettings, isValidImport } from './storage.js';
                                            import { validateField } from './validators.js';
                                            import { compileRegex, filterRecords, sortRecords } from './search.js'; 
                                            import { renderTable, renderStats } from './ui.js';
                                            
                                            let records = loadRecords();
                                            let settings = loadSettings();                                            
                                            let editingId = null;  

                                            const form = document.getElementById('task-form');
                                            const fields = ['title','duration','tag', 'startTime', 'dueDate'];

                                        function refresh() {
                                            const searchText = document.getElementById('search').value;
                                            const re = compileRegex(searchText, document.getElementById('case-toggle').checked);
                                            const status = document.getElementById('search-status');
                                             
                                            if (searchText !== '' && re === null) {
                                               status.textContent = 'Invalid regex pattern.';
                                           } else {
                                                status.textContent = '';
                                            }
                                                let list = filterRecords(records, re);
                                                list = sortRecords(list, document.getElementById('sort').value);

                                                renderTable(list, re, settings.unit);
                                                renderStats(records, settings.cap, settings.unit);

                                            }
                                          
                                            function generateId() {
                                              let max = 0;
                                              for (const r of records) {
                                              const number = parseInt(r.id.slice(4));
                                              if(number > max) {
                                                max = number;
                                                }

                                              }
                                              return 'rec_' + String(max + 1).padStart(4, '0');
                                            }
                                            
                                            function showError(name, message) {
                                              document.getElementById(name + '-error').textContent = message;
                                              document.getElementById(name).setAttribute('aria-invalid', message ? 'true' : 'false');

                                            }

                                            for (const name of fields) {
                                            document.getElementById(name).addEventListener('input', function () {
                                              showError(name, validateField(name, this.value));

                                            });

                                            }

                                            form.addEventListener('submit', function (event) {
                                              event.preventDefault();
                                            
                                              let allGood = true;
                                              for (const name of fields) {
                                                   const message = validateField(name, document.getElementById(name).value);
                                                showError(name, message);
                                                if (message !== '') {
                                                  allGood = false;

                                                }
                                              }
                                              if (!allGood) {
                                                document.getElementById('form-status').textContent = 'Please fix the errors above.';
                                                return; 

                                              }

                                              const now = new Date(). toISOString();
                                              const data = {
                                                title: document.getElementById('title').value,
                                                duration: parseFloat(document.getElementById('duration').value),
                                                tag: document.getElementById('tag').value,
                                                startTime : document.getElementById('startTime').value,
                                                 dueDate: document.getElementById('dueDate').value

                                                };

                                                if (editingId === null) {
                                                  data.id = generateId();
                                                  data.createdAt = now;
                                                  data.updatedAt = now;
                                                  records.push(data);
                                                  document.getElementById('form-status').textContent = 'Task added.';
                                                } else {
                                                  for (const r of records) {
                                                   if (r.id === editingId) {
                                                       r.title = data.title;
                                                       r.duration = data.duration;
                                                       r.tag = data.tag;
                                                       r.startTime = data.startTime;
                                                       r.dueDate = data.dueDate;
                                                       r.updatedAt = now;

                                                   }

                                                  }
                                                  editingId = null;
                                                  document.getElementById('form-status').textContent = 'Task updated.';

                                                }

                                                saveRecords(records);
                                                form.reset();
                                                refresh();

                                              });

                                              document.getElementById('table-body').addEventListener('click', function (event) {
                                                const action = event.target.dataset.action;
                                                const id = event.target.dataset.id;

                                                if (action === 'delete') {
                                                  if (confirm('Delete this task?')) {
                                                    records = records.filter(function (r) {
                                                    return r.id !== id;

                                                  });
                                                  saveRecords(records);
                                                  refresh();

                                                }

                                              }

                                              if (action === 'edit') {
                                                for (const r of records) {
                                                  if (r.id === id) {
                                                     document.getElementById('title').value = r.title;
                                                     document.getElementById('duration').value = r.duration;
                                                     document.getElementById('tag').value = r.tag;
                                                     document.getElementById('startTime').value = r.startTime;
                                                     document.getElementById('dueDate').value = r.dueDate;
                                                     editingId = id;
                                                     document.getElementById('form-status').textContent = 'Editing "' + r.title + '". Change it and press Save.';
                                                     document.getElementById('title').focus();
                                        
                                                  }
                                                }
                                              }

                                            });   
                                           
                                    document.getElementById('search').addEventListener('input', refresh);
                                    document.getElementById('case-toggle').addEventListener('change', refresh);
                                    document.getElementById('sort').addEventListener('change', refresh);

                                    const unitSelect = document.getElementById('unit-select');
                                    unitSelect.value = settings.unit;
                                     unitSelect.addEventListener('change', function () {
                                        settings.unit = unitSelect.value;
                                            saveSettings(settings);
                                            refresh();
                                     });

                                     const capInput = document.getElementById('cap-input');
                                     capInput.value = settings.cap;
                                     capInput.addEventListener('input', function () {
                                         settings.cap = capInput.value;
                                         saveSettings(settings);
                                         refresh();
                                  });

                                  document.getElementById('export-btn') .addEventListener('click', function () {
                                     const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
                                    const link = document.createElement('a');
                                    link.href = URL.createObjectURL(blob);
                                    link.download = 'campus-tasks.json';
                                    link.click();
                                  });

                                   document.getElementById('import-file') .addEventListener('change', function (event) {
                                    const status = document.getElementById('import-status');
                                    const reader = new FileReader ();
                                    reader.onload = function () {
                                     try {
                                       const data = JSON.parse(reader.result);
                                    if (!isValidImport(data)) {
                                        status.textContent = 'Import failed: wrong structure.';
                                      return;
                                      
                                    }
                                      records = data;
                                      saveRecords(records);
                                      status.textContent = 'Imported ' + data.length + ' tasks.';
                                      refresh();
                                  } catch (error) {
                                      status.textContent = 'Import failed: not valid JSON.';
                                       }

                                    };
                                    reader.readAsText( event. target. files[0]);

                                   });
                                    
                                   refresh();