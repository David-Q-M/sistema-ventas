import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
    providedIn: 'root'
})
export class ExcelService {

    constructor() { }

    public exportAsExcelFile(json: any[], excelFileName: string): void {
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);

        // Auto-width adjustment
        this.autoFitColumns(json, worksheet);

        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, excelFileName);
    }

    private autoFitColumns(json: any[], worksheet: XLSX.WorkSheet) {
        const objectMaxLength: number[] = [];
        const colNames = Object.keys(json[0]);

        // Header length
        colNames.forEach((col, i) => {
            objectMaxLength[i] = col.length;
        });

        // Content length
        json.forEach(row => {
            colNames.forEach((col, i) => {
                const cellValue = row[col] ? String(row[col]) : '';
                if (cellValue.length > objectMaxLength[i]) {
                    objectMaxLength[i] = cellValue.length;
                }
            });
        });

        // Apply width (max 50 chars to avoid huge columns)
        worksheet['!cols'] = objectMaxLength.map(w => ({ width: Math.min(w + 2, 50) }));
    }

    private saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
        const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        FileSaver.saveAs(data, fileName + '_export_' + date + EXCEL_EXTENSION);
    }
}
