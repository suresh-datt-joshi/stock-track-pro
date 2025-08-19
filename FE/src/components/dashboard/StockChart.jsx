// src/components/dashboard/StockChart.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { format, parseISO } from 'date-fns';

Chart.register(...registerables);

const TimeRangeSelector = ({ currentRange, onRangeChange }) => {
    const ranges = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'Max'];
    return (
        <div className="flex flex-wrap justify-center gap-2 my-4">
            {ranges.map(range => (
                <button
                    key={range}
                    onClick={() => onRangeChange(range)}
                    className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                        currentRange === range
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    {range}
                </button>
            ))}
        </div>
    );
};


const StockChart = ({ data, onRangeChange, currentRange, isLoading, error }) => {
    const chartRef = useRef(null);
    const [chartBgColor, setChartBgColor] = useState('transparent');
    
    const formatLabel = (dateStr, range) => {
        const date = parseISO(dateStr);
        switch (range) {
            case '1D': return format(date, 'h:mm a');
            case '5D': return format(date, 'MMM d, ha');
            case '1M': return format(date, 'MMM d');
            case '6M':
            case 'YTD':
            case '1Y': return format(date, 'MMM yyyy');
            case '5Y':
            case 'Max': return format(date, 'yyyy');
            default: return dateStr;
        }
    }
    
    const isUp = (data && data.length > 1) ? data[data.length - 1].price >= data[0].price : true;
    const lineColor = isUp ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)';
    const gradientStartColor = isUp ? 'rgba(34, 197, 94, 0)' : 'rgba(239, 68, 68, 0)';
    const gradientEndColor = isUp ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)';

    useEffect(() => {
        const chart = chartRef.current;
        if (chart && chart.chartArea) {
            const gradient = chart.ctx.createLinearGradient(0, chart.chartArea.bottom, 0, chart.chartArea.top);
            gradient.addColorStop(0, gradientStartColor);
            gradient.addColorStop(1, gradientEndColor);
            setChartBgColor(gradient);
        }
    }, [data, gradientStartColor, gradientEndColor]);

    const chartData = {
        labels: data ? data.map(item => item.date) : [],
        datasets: [
            {
                label: 'Stock Price (USD)',
                data: data ? data.map(item => item.price) : [],
                borderColor: lineColor,
                backgroundColor: chartBgColor,
                fill: true,
                tension: 0.3,
                borderWidth: 2,
                pointRadius: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        scales: {
            x: {
                ticks: {
                    maxTicksLimit: 7,
                    callback: function(value) {
                       // 'this' refers to the scale instance
                       const label = this.getLabelForValue(value);
                       return formatLabel(label, currentRange);
                    }
                },
                grid: { display: false },
            },
            y: { position: 'right', grid: { color: 'rgba(200, 200, 200, 0.1)' } },
        },
    };

    return (
        <div className="mt-6">
            <TimeRangeSelector currentRange={currentRange} onRangeChange={onRangeChange} />
            <div style={{ height: '250px', position: 'relative' }}>
                {(isLoading) && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">Loading chart...</div>}
                {error && !isLoading && <div className="absolute inset-0 flex items-center justify-center text-red-500">{error}</div>}
                {data && data.length > 0 && !isLoading && <Line ref={chartRef} data={chartData} options={options} />}
                {data && data.length === 0 && !isLoading && <div className="absolute inset-0 flex items-center justify-center text-gray-500">No data available for this range.</div>}
            </div>
        </div>
    );
};

export default StockChart;