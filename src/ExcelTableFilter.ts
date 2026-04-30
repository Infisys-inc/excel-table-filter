import { FilterMenu } from './FilterMenu';
import { Options } from './Options';

export default class ExcelTableFilter {
  private filterMenus: FilterMenu[] = [];
  private rows: HTMLElement[] = [];
  private ths: HTMLElement[] = [];
  private table: HTMLElement;
  private options: Options;
  private target: HTMLElement;

  constructor(target: HTMLElement, options: Partial<Options> = {}) {
    const defaultOptions: Options = {
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
    this.ths = Array.from(target.querySelectorAll(`th${this.options.columnSelector}`)) as HTMLElement[];
    this.filterMenus = this.ths.map((th, index) => {
      const column = Array.from(th.parentElement?.children || []).indexOf(th);
      return new FilterMenu(target, th, column, index, this.options);
    });
    this.rows = Array.from(target.querySelectorAll('tbody tr')) as HTMLElement[];

    this.initialize();
  }

  private initialize(): void {
    this.filterMenus.forEach(menu => menu.initialize());
    this.bindEvents();
  }

  private bindEvents(): void {
    this.target.addEventListener('change', (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (!target) return;

      const indexStr = target.getAttribute('data-index');
      if (indexStr === null) return;
      const index = parseInt(indexStr, 10);
      if (Number.isNaN(index) || !this.filterMenus[index]) return;

      if (target.classList.contains('item')) {
        this.filterMenus[index].updateSelectAll();
      } else if (target.classList.contains('select-all')) {
        this.filterMenus[index].selectAllUpdate(target.checked);
      }
      this.updateRowVisibility();
    });

    this.target.addEventListener('click', (event: Event) => {
      const sortTrigger = (event.target as HTMLElement).closest('.dropdown-filter-sort');
      if (sortTrigger) {
        const span = sortTrigger.querySelector('span');
        if (span) {
          const column = parseInt(span.getAttribute('data-column') || '0', 10);
          const order = span.className;
          this.sort(column, order);
          this.updateRowVisibility();
        }
      }
    });

    this.target.addEventListener('keyup', (event: Event) => {
      const searchInput = (event.target as HTMLElement).closest('.dropdown-filter-search')?.querySelector('input');
      if (searchInput) {
        const index = parseInt(searchInput.getAttribute('data-index') || '0', 10);
        this.filterMenus[index].searchToggle(searchInput.value);
        this.updateRowVisibility();
      }
    });
  }

  private updateRowVisibility(): void {
    const selectedLists = this.filterMenus.map(menu => ({
      column: menu.column,
      selected: new Set(menu.inputs
        .filter(input => (input as HTMLInputElement).checked)
        .map(input => (input as HTMLInputElement).value.trim().replace(/\s+/g, ' '))
      )
    }));

    this.rows.forEach(row => {
      const tds = row.children;
      const visible = selectedLists.every(list => {
        const content = (tds[list.column] as HTMLElement).textContent.trim().replace(/\s+/g, ' ');
        return list.selected.has(content);
      });
      row.style.display = visible ? '' : 'none';
    });
  }

  private sort(column: number, order: string): void {
    const flip = order === this.options.captions.z_to_a.toLowerCase().replace(/\s+/g, '-') ? -1 : 1;
    const tbody = this.table.querySelector('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.sort((a, b) => {
      const A = (a.children[column] as HTMLElement).textContent.toUpperCase();
      const B = (b.children[column] as HTMLElement).textContent.toUpperCase();

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
