import { Options } from './Options';
export default class ExcelTableFilter {
    private filterMenus;
    private rows;
    private ths;
    private table;
    private options;
    private target;
    constructor(target: HTMLElement, options?: Partial<Options>);
    private initialize;
    private bindEvents;
    private updateRowVisibility;
    private sort;
}
