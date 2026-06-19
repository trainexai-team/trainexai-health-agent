"use client";

import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WeeklyReportChartProps {
  data: {
    labels: string[];
    scores: number[];
    sleepData?: number[];
  };
}

export default function WeeklyReportChart({ data }: WeeklyReportChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    chartInstance.current = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Consistency Score",
            data: data.scores,
            borderColor: "#17324D",
            backgroundColor: "rgba(23, 50, 77, 0.1)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#17324D",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          ...(data.sleepData
            ? [
                {
                  label: "Sleep (hours)",
                  data: data.sleepData,
                  borderColor: "#F59E0B",
                  backgroundColor: "rgba(245, 158, 11, 0.1)",
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: "#F59E0B",
                  pointBorderColor: "#fff",
                  pointBorderWidth: 2,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  yAxisID: "y1",
                },
              ]
            : []),
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: "index",
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              usePointStyle: true,
              boxWidth: 6,
            },
          },
          tooltip: {
            backgroundColor: "#1f2937",
            titleColor: "#fff",
            bodyColor: "#d1d5db",
            padding: 12,
            cornerRadius: 8,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: "rgba(0,0,0,0.05)",
            },
            ticks: {
              font: { size: 11 },
            },
          },
          y1: {
            beginAtZero: true,
            max: 12,
            position: "right",
            grid: {
              display: false,
            },
            ticks: {
              font: { size: 11 },
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: { size: 11 },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="w-full h-64">
      <canvas ref={chartRef} />
    </div>
  );
}
