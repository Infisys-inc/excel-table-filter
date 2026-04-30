import { Options } from './Options';

export class FilterMenu {
  public column: number;
  public inputs: HTMLInputElement[] = [];

  private th: HTMLElement;
  private tds: HTMLElement[];
  private index: number;
  private menu!: HTMLElement;
  private selectAllCheckbox!: HTMLInputElement;
  private searchFilter!: HTMLInputElement;
  private options: Options;

  constructor(target: HTMLElement, th: HTMLElement, column: number, index: number, options: Options) {
    this.options = options;
    this.th = th;
    this.column = column;
    this.index = index;
    this.tds = Array.from(target.querySelectorAll(`tbody tr td:nth-child(${this.column + 1})`)) as HTMLElement[];
  }

  public initialize(): void {
    this.menu = this.createMenu();
    this.th.appendChild(this.menu);

    const trigger = this.menu.querySelector('.dropdown-filter-icon') as HTMLElement;
    const content = this.menu.querySelector('.dropdown-filter-content') as HTMLElement;

    trigger.addEventListener('click', (e) => {
      const isVisible = content.style.display === 'block';
      content.style.display = isVisible ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
      if (!this.menu.contains(e.target as Node)) {
        content.style.display = 'none';
      }
    });
  }

  public searchToggle(value: string): void {
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

  public updateSelectAll(): void {
    this.searchFilter.value = '';
    this.selectAllCheckbox.checked = this.inputs.every(input => input.checked);
  }

  public selectAllUpdate(checked: boolean): void {
    this.searchFilter.value = '';
    this.toggleAll(checked);
  }

  private toggleAll(checked: boolean): void {
    this.inputs.forEach(input => input.checked = checked);
  }

  private createItem(text: string, className: string, isChecked: boolean = true): HTMLElement {
    const div = document.createElement('div');
    div.className = 'dropdown-filter-item';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = text.trim().replace(/\s+/g, ' ');
    if (isChecked) input.checked = true;
    input.className = className;
    input.dataset.column = this.column.toString();
    input.dataset.index = this.index.toString();
    div.append(input, ` ${text}`);
    return div;
  }

  private createMenu(): HTMLElement {
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
      this.selectAllCheckbox = selectAllDiv.querySelector('input') as HTMLInputElement;
      container.append(selectAllDiv);

      const uniqueValues = Array.from(new Set(this.tds.map(td => td.innerText.trim())))
        .sort((a, b) => {
          const numA = Number(a), numB = Number(b);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return a.localeCompare(b);
        });

      uniqueValues.forEach(val => {
        const itemDiv = this.createItem(val, 'dropdown-filter-menu-item item');
        this.inputs.push(itemDiv.querySelector('input') as HTMLInputElement);
        container.append(itemDiv);
      });
      content.append(container);
    }

    menu.append(content);
    return menu;
  }
}
