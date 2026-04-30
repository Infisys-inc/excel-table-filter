var ExcelTableFilter = (function () {
    'use strict';

    class FilterMenu {
        column;
        inputs = [];
        th;
        tds;
        index;
        menu;
        selectAllCheckbox;
        searchFilter;
        options;
        constructor(target, th, column, index, options) {
            this.options = options;
            this.th = th;
            this.column = column;
            this.index = index;
            this.tds = Array.from(target.querySelectorAll(`tbody tr td:nth-child(${this.column + 1})`));
        }
        initialize() {
            this.menu = this.createMenu();
            this.th.appendChild(this.menu);
            const trigger = this.menu.querySelector('.dropdown-filter-icon');
            const content = this.menu.querySelector('.dropdown-filter-content');
            trigger.addEventListener('click', (e) => {
                const isVisible = content.style.display === 'block';
                content.style.display = isVisible ? 'none' : 'block';
            });
            document.addEventListener('click', (e) => {
                if (!this.menu.contains(e.target)) {
                    content.style.display = 'none';
                }
            });
        }
        searchToggle(value) {
            this.selectAllCheckbox.checked = value.length === 0;
            if (value.length === 0) {
                this.toggleAll(true);
                return;
            }
            this.toggleAll(false);
            const lowerValue = value.toLowerCase();
            this.inputs.forEach(input => {
                if (input.value.toLowerCase().includes(lowerValue)) {
                    input.checked = true;
                }
            });
        }
        updateSelectAll() {
            this.searchFilter.value = '';
            this.selectAllCheckbox.checked = this.inputs.every(input => input.checked);
        }
        selectAllUpdate(checked) {
            this.searchFilter.value = '';
            this.toggleAll(checked);
        }
        toggleAll(checked) {
            this.inputs.forEach(input => input.checked = checked);
        }
        createItem(text, className, isChecked = true) {
            const div = document.createElement('div');
            div.className = 'dropdown-filter-item';
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.value = text.trim().replace(/\s+/g, ' ');
            if (isChecked)
                input.checked = true;
            input.className = className;
            input.dataset.column = this.column.toString();
            input.dataset.index = this.index.toString();
            div.append(input, ` ${text}`);
            return div;
        }
        createMenu() {
            const menu = document.createElement('div');
            menu.className = 'dropdown-filter-dropdown';
            const arrow = document.createElement('span');
            arrow.className = 'dropdown-filter-icon';
            const icon = document.createElement('i');
            icon.className = 'arrow-down';
            arrow.append(icon);
            menu.append(arrow);
            const content = document.createElement('div');
            content.className = 'dropdown-filter-content';
            content.style.display = 'none';
            if (this.options.sort && !this.th.classList.contains('no-sort')) {
                [this.options.captions.a_to_z, this.options.captions.z_to_a].forEach(text => {
                    const sortDiv = document.createElement('div');
                    sortDiv.className = 'dropdown-filter-sort';
                    const span = document.createElement('span');
                    span.className = text.toLowerCase().replace(/\s+/g, '-');
                    span.dataset.column = this.column.toString();
                    span.dataset.index = this.index.toString();
                    span.innerText = text;
                    sortDiv.append(span);
                    content.append(sortDiv);
                });
            }
            if (this.options.search && !this.th.classList.contains('no-search')) {
                const searchDiv = document.createElement('div');
                searchDiv.className = 'dropdown-filter-search';
                this.searchFilter = document.createElement('input');
                this.searchFilter.type = 'text';
                this.searchFilter.className = 'dropdown-filter-menu-search';
                this.searchFilter.dataset.column = this.column.toString();
                this.searchFilter.dataset.index = this.index.toString();
                this.searchFilter.placeholder = this.options.captions.search;
                searchDiv.append(this.searchFilter);
                content.append(searchDiv);
            }
            if (!this.th.classList.contains('no-filter')) {
                const container = document.createElement('div');
                container.className = 'checkbox-container';
                const selectAllDiv = this.createItem(this.options.captions.select_all, 'dropdown-filter-menu-item select-all');
                this.selectAllCheckbox = selectAllDiv.querySelector('input');
                container.append(selectAllDiv);
                const uniqueValues = Array.from(new Set(this.tds.map(td => td.innerText.trim())))
                    .sort((a, b) => {
                    const numA = Number(a), numB = Number(b);
                    if (!isNaN(numA) && !isNaN(numB))
                        return numA - numB;
                    return a.localeCompare(b);
                });
                uniqueValues.forEach(val => {
                    const itemDiv = this.createItem(val, 'dropdown-filter-menu-item item');
                    this.inputs.push(itemDiv.querySelector('input'));
                    container.append(itemDiv);
                });
                content.append(container);
            }
            menu.append(content);
            return menu;
        }
    }

    class ExcelTableFilter {
        filterMenus = [];
        rows = [];
        ths = [];
        table;
        options;
        target;
        constructor(target, options = {}) {
            const defaultOptions = {
                columnSelector: '',
                sort: true,
                search: true,
                captions: {
                    a_to_z: 'A to Z',
                    z_to_a: 'Z to A',
                    search: 'Search',
                    select_all: 'Select All'
                }
            };
            this.options = {
                ...defaultOptions,
                ...options,
                captions: {
                    ...defaultOptions.captions,
                    ...(options.captions || {})
                }
            };
            this.target = target;
            this.table = target;
            this.ths = Array.from(target.querySelectorAll(`th${this.options.columnSelector}`));
            this.filterMenus = this.ths.map((th, index) => {
                const column = Array.from(th.parentElement?.children || []).indexOf(th);
                return new FilterMenu(target, th, column, index, this.options);
            });
            this.rows = Array.from(target.querySelectorAll('tbody tr'));
            this.initialize();
        }
        initialize() {
            this.filterMenus.forEach(menu => menu.initialize());
            this.bindEvents();
        }
        bindEvents() {
            this.target.addEventListener('change', (event) => {
                const target = event.target;
                if (!target)
                    return;
                const indexStr = target.getAttribute('data-index');
                if (indexStr === null)
                    return;
                const index = parseInt(indexStr);
                if (target.classList.contains('item')) {
                    this.filterMenus[index].updateSelectAll();
                }
                else if (target.classList.contains('select-all')) {
                    this.filterMenus[index].selectAllUpdate(target.checked);
                }
                this.updateRowVisibility();
            });
            this.target.addEventListener('click', (event) => {
                const sortTrigger = event.target.closest('.dropdown-filter-sort');
                if (sortTrigger) {
                    const span = sortTrigger.querySelector('span');
                    if (span) {
                        const column = parseInt(span.getAttribute('data-column') || '0');
                        const order = span.className;
                        this.sort(column, order);
                        this.updateRowVisibility();
                    }
                }
            });
            this.target.addEventListener('keyup', (event) => {
                const searchInput = event.target.closest('.dropdown-filter-search')?.querySelector('input');
                if (searchInput) {
                    const index = parseInt(searchInput.getAttribute('data-index') || '0');
                    this.filterMenus[index].searchToggle(searchInput.value);
                    this.updateRowVisibility();
                }
            });
        }
        updateRowVisibility() {
            const selectedLists = this.filterMenus.map(menu => ({
                column: menu.column,
                selected: new Set(menu.inputs
                    .filter(input => input.checked)
                    .map(input => input.value.trim().replace(/\s+/g, ' ')))
            }));
            this.rows.forEach(row => {
                const tds = row.children;
                const visible = selectedLists.every(list => {
                    const content = tds[list.column].innerText.trim().replace(/\s+/g, ' ');
                    return list.selected.has(content);
                });
                row.style.display = visible ? '' : 'none';
            });
        }
        sort(column, order) {
            const flip = order === this.options.captions.z_to_a.toLowerCase().replace(/\s+/g, '-') ? -1 : 1;
            const tbody = this.table.querySelector('tbody');
            if (!tbody)
                return;
            const rows = Array.from(tbody.querySelectorAll('tr'));
            rows.sort((a, b) => {
                const A = a.children[column].innerText.toUpperCase();
                const B = b.children[column].innerText.toUpperCase();
                const numA = Number(A);
                const numB = Number(B);
                if (!isNaN(numA) && !isNaN(numB)) {
                    return (numA - numB) * flip;
                }
                return A.localeCompare(B) * flip;
            });
            rows.forEach(row => tbody.appendChild(row));
        }
    }

    return ExcelTableFilter;

})();
//# sourceMappingURL=excel-table-filter-bundle.js.map
