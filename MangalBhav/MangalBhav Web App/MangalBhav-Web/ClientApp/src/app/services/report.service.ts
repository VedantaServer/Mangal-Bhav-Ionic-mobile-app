import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private reportTypeSource = new BehaviorSubject<string>('');
  currentReportType = this.reportTypeSource.asObservable();

  setReportType(reportType: string) {
    this.reportTypeSource.next(reportType);
  }
}
