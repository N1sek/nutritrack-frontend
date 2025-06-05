import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { formatDate } from '@angular/common';
import { Subscription } from 'rxjs';
import { UserService, UserProfile } from '../../core/user/user.service';
import { DailyLogService, DailyLogResponse, DailyLog } from '../../core/daily-log.service';
import {NavbarComponent} from '../../shared/components/navbar/navbar.component';

type ActivityLevel = 'SEDENTARY' | 'MODERATE' | 'ACTIVE';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  userName = '';
  userWeight: number | null = null;
  fastingHours: number | null = null;

  caloriesConsumed = 0;
  proteinConsumed = 0;
  carbsConsumed = 0;
  fatConsumed = 0;

  calorieGoal = 2000;
  proteinGoal = 150;
  carbsGoal = 250;
  fatGoal = 70;

  recentEntries: {
    id: number;
    name: string;
    image: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[] = [];

  chartCalories?: Chart;
  chartWeight?: Chart;

  private profileSub?: Subscription;

  constructor(
    private userService: UserService,
    private dailyLogService: DailyLogService
  ) {}

  ngOnInit(): void {
    const today = formatDate(new Date(), 'yyyy-MM-dd', 'en');

    // 1) Obtener log diario (con entradas) del día actual
    this.dailyLogService.getDiary(today).subscribe({
      next: (res: DailyLogResponse) => {
        // Totales del día (aseguramos fallback a 0/nulo)
        this.caloriesConsumed = Math.round(res.totalCalories || 0);
        this.proteinConsumed = Math.round(res.totalProtein || 0);
        this.carbsConsumed = Math.round(res.totalCarbs || 0);
        this.fatConsumed = Math.round(res.totalFat || 0);

        // Horas de ayuno del día
        this.fastingHours = res.fastingHours || 0;

        // Convertir entradas a lista simplificada
        this.recentEntries = (res.entries || []).map(entry => {
          const item = entry.food || entry.recipe;
          const qty = entry.quantity || 0;
          return {
            id: entry.id,
            name: item?.name || 'Desconocido',
            image: item?.imageUrl || '',
            quantity: `${qty}g`,
            calories: Math.round((item?.calories || 0) * qty / 100),
            protein: Math.round((item?.protein || 0) * qty / 100),
            carbs: Math.round((item?.carbs || 0) * qty / 100),
            fat: Math.round((item?.fat || 0) * qty / 100)
          };
        });
      },
      error: () => {
        this.caloriesConsumed = 0;
        this.proteinConsumed = 0;
        this.carbsConsumed = 0;
        this.fatConsumed = 0;
        this.fastingHours = 0;
        this.recentEntries = [];
      }
    });

    // 2) Suscribirse a cambios de perfil (nombre, peso y recálculo de objetivos)
    this.profileSub = this.userService.profileChanged$.subscribe({
      next: (user: UserProfile | null) => {
        if (user) {
          this.userName = user.name || '';
          this.userWeight = user.weight || null;

          if (user.weight && user.height && user.birthDate && user.activityLevel) {
            const age = this.calculateAge(user.birthDate);
            this.calorieGoal = this.calculateCalorieGoal(
              user.weight,
              user.height,
              age,
              user.goal,
              user.activityLevel
            );
            this.proteinGoal = Math.round(user.weight * 2);
            this.fatGoal = Math.round(user.weight * 1);
            this.carbsGoal = Math.round(
              (this.calorieGoal - (this.proteinGoal * 4 + this.fatGoal * 9)) / 4
            );
          }
        }
      }
    });

    // Emitir perfil inicial
    this.userService.loadInitialProfile();
  }

  ngAfterViewInit(): void {
    // 3) Cargar datos históricos para gráficas
    this.loadCharts();
  }

  ngOnDestroy(): void {
    this.profileSub?.unsubscribe();
  }

  /**
   * Calcula edad a partir de una fecha ISO (yyyy-MM-dd)
   */
  private calculateAge(birthDateStr: string): number {
    const birth = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Calcula el objetivo calórico usando fórmula de Harris-Benedict simplificada
   */
  private calculateCalorieGoal(
    weight: number,
    height: number,
    age: number,
    goal: UserProfile['goal'],
    activityLevel: ActivityLevel
  ): number {
    const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    const activityMultiplier: Record<ActivityLevel, number> = {
      SEDENTARY: 1.2,
      MODERATE: 1.55,
      ACTIVE: 1.8
    };
    const multiplier = activityMultiplier[activityLevel] || 1.55;
    let calories = bmr * multiplier;

    switch (goal) {
      case 'GAIN':
        calories += 300;
        break;
      case 'LOSE':
        calories -= 300;
        break;
    }

    return Math.round(calories);
  }

  private loadCharts(): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);

    const start = formatDate(startDate, 'yyyy-MM-dd', 'en');
    const end = formatDate(endDate, 'yyyy-MM-dd', 'en');

    this.dailyLogService.getExistingLogsInRange(start, end).subscribe({
      next: (data: DailyLog[]) => {
        this.renderCaloriesChart(data);
        this.renderWeightChart(data);
      },
      error: () => {
        // Omitimos error visual
      }
    });
  }

  private renderCaloriesChart(data: DailyLog[]): void {
    const labels = data.map(r => r.date);
    const values = data.map(r => Math.round(r.totalCalories || 0));
    const canvas = document.getElementById('caloriasChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chartCalories) {
      this.chartCalories.data.labels = labels;
      this.chartCalories.data.datasets = [
        {
          label: 'Calorías',
          data: values,
          backgroundColor: 'rgba(78, 171, 249, 0.2)',
          borderColor: '#4eabf9',
          fill: true
        }
      ];
      this.chartCalories.update();
    } else {
      this.chartCalories = new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Calorías',
              data: values,
              backgroundColor: 'rgba(78, 171, 249, 0.2)',
              borderColor: '#4eabf9',
              fill: true
            }
          ]
        },
        options: {
          scales: {
            x: {
              ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 }
            },
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  private renderWeightChart(data: DailyLog[]): void {
    const weightData = data.filter(r => r.weight != null);
    const labels = weightData.map(r => r.date);
    const values = weightData.map(r => r.weight || 0);
    const canvas = document.getElementById('pesoChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chartWeight) {
      this.chartWeight.data.labels = labels;
      this.chartWeight.data.datasets = [
        {
          label: 'Peso (kg)',
          data: values,
          backgroundColor: '#4eabf9'
        }
      ];
      this.chartWeight.update();
    } else {
      this.chartWeight = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Peso (kg)',
              data: values,
              backgroundColor: '#4eabf9'
            }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  // Getters para mostrar balances restantes
  get caloriesRemaining(): number {
    return this.calorieGoal - this.caloriesConsumed;
  }
  get proteinRemaining(): number {
    return this.proteinGoal - this.proteinConsumed;
  }
  get carbsRemaining(): number {
    return this.carbsGoal - this.carbsConsumed;
  }
  get fatRemaining(): number {
    return this.fatGoal - this.fatConsumed;
  }
}
