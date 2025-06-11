import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { BoxComponent } from '../../../shared/components/box/box.component';
import { CommonModule } from '@angular/common';
import { DailyLogService, DailyLog } from '../../../core/daily-log.service';
import {HttpClient, HttpParams} from '@angular/common/http';


@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BoxComponent,
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  startDate: string = '';
  endDate: string = '';
  today: string = '';
  maxRangeDays = 7;
  rangeTooLarge = false;

  records: DailyLog[] = [];

  private caloriesChart?: Chart;
  private macrosChart?: Chart;

  constructor(private dailyLogService: DailyLogService, private http: HttpClient) {}

  ngOnInit(): void {
    this.today = new Date().toISOString().substring(0, 10);
  }

  onFiltersChange(): void {
    if (!this.startDate || !this.endDate || this.endDate < this.startDate) {
      this.clearData();
      return;
    }

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24) + 1;

    if (diffDays > this.maxRangeDays) {
      this.rangeTooLarge = true;
      this.records = [];
      this.destroyCharts();
      return;
    }

    this.rangeTooLarge = false;

    this.dailyLogService.getExistingLogsInRange(this.startDate, this.endDate).subscribe({
      next: (data: DailyLog[]) => {
        this.records = data;
        this.updateCharts();
      },
      error: err => {
        console.error('Error fetching logs in range:', err);
        this.records = [];
        this.destroyCharts();
      }
    });
  }

  private updateCharts(): void {
    if (this.records.length === 0) {
      this.destroyCharts();
      return;
    }

    const labels = this.records.map(r => r.date);
    const caloriesValues = this.records.map(r => r.totalCalories);
    const proteinValues = this.records.map(r => r.totalProtein);
    const carbsValues = this.records.map(r => r.totalCarbs);
    const fatValues = this.records.map(r => r.totalFat);

    const calCanvas = document.getElementById('caloriesChart') as HTMLCanvasElement | null;
    if (calCanvas) {
      if (this.caloriesChart) {
        this.caloriesChart.data.labels = labels;
        this.caloriesChart.data.datasets = [{
          label: 'Calories Consumed',
          data: caloriesValues,
          borderColor: '#4eabf9',
          backgroundColor: 'rgba(78, 171, 249, 0.2)',
          fill: true
        }];
        this.caloriesChart.update();
      } else {
        this.caloriesChart = new Chart(calCanvas, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Calories Consumed',
              data: caloriesValues,
              borderColor: '#4eabf9',
              backgroundColor: 'rgba(78, 171, 249, 0.2)',
              fill: true
            }]
          },
          options: {
            scales: {
              x: {
                ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 }
              },
              y: { beginAtZero: true }
            }
          }
        });
      }
    }

    const macroCanvas = document.getElementById('macrosChart') as HTMLCanvasElement | null;
    if (macroCanvas) {
      if (this.macrosChart) {
        this.macrosChart.data.labels = labels;
        this.macrosChart.data.datasets = [
          {
            label: 'Protein (g)',
            data: proteinValues,
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.2)',
            fill: true
          },
          {
            label: 'Carbs (g)',
            data: carbsValues,
            borderColor: '#ffc107',
            backgroundColor: 'rgba(255, 193, 7, 0.2)',
            fill: true
          },
          {
            label: 'Fat (g)',
            data: fatValues,
            borderColor: '#dc3545',
            backgroundColor: 'rgba(220, 53, 69, 0.2)',
            fill: true
          }
        ];
        this.macrosChart.update();
      } else {
        this.macrosChart = new Chart(macroCanvas, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Protein (g)',
                data: proteinValues,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.2)',
                fill: true
              },
              {
                label: 'Carbs (g)',
                data: carbsValues,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.2)',
                fill: true
              },
              {
                label: 'Fat (g)',
                data: fatValues,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.2)',
                fill: true
              }
            ]
          },
          options: {
            scales: {
              x: {
                ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 }
              },
              y: { beginAtZero: true }
            }
          }
        });
      }
    }
  }

  private destroyCharts(): void {
    if (this.caloriesChart) {
      this.caloriesChart.destroy();
      this.caloriesChart = undefined;
    }
    if (this.macrosChart) {
      this.macrosChart.destroy();
      this.macrosChart = undefined;
    }
  }

  private clearData(): void {
    this.rangeTooLarge = false;
    this.records = [];
    this.destroyCharts();
  }

  trackByDate(_: number, item: DailyLog): string {
    return item.date;
  }

  exportReport(format: 'csv' | 'excel' | 'pdf'): void {
    const params = new HttpParams()
      .set('start', this.startDate)
      .set('end',   this.endDate)
      .set('format', format);

    this.http.get('/api/v1/daily-log/export', {
      params,
      responseType: 'blob'
    }).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = format === 'excel' ? 'xlsx' : format;
        a.download = `informe_${this.startDate}_a_${this.endDate}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: err => console.error('Error exportando informe:', err)
    });
  }

}
