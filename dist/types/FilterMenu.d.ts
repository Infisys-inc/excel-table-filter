import { Options } from './Options';
export declare class FilterMenu {
    column: number;
    inputs: HTMLInputElement[];
    private th;
    private tds;
    private index;
    private menu;
    private selectAllCheckbox;
    private searchFilter;
    private options;
    constructor(target: HTMLElement, th: HTMLElement, column: number, index: number, options: Options);
    initialize(): void;
    searchToggle(value: string): void;
    updateSelectAll(): void;
    selectAllUpdate(checked: boolean): void;
    private toggleAll;
    private createItem;
    private createMenu;
}
