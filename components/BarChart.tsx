
import React from 'react';
import { ChartData } from '../types';

interface BarChartProps {
    data: ChartData;
}

const BarChart = ({ data }: BarChartProps) => {
    if (!data || data.values.length === 0) {
        return <div className="flex items-center justify-center h-full text-slate-500">No data to display.</div>;
    }

    const maxValue = Math.max(...data.values);
    const chartHeight = 250;
    const barWidth = 40;
    const barMargin = 20;
    const chartWidth = data.labels.length * (barWidth + barMargin);

    return (
        <div className="w-full h-full overflow-x-auto overflow-y-hidden">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="100%" preserveAspectRatio="xMinYMax meet">
                {data.values.map((value, index) => {
                    const barHeight = maxValue === 0 ? 0 : (value / maxValue) * (chartHeight - 30);
                    const x = index * (barWidth + barMargin);
                    const y = chartHeight - barHeight - 20;

                    return (
                        <g key={index}>
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                className="fill-current text-indigo-500"
                            />
                            <text
                                x={x + barWidth / 2}
                                y={y - 5}
                                textAnchor="middle"
                                className="text-xs font-semibold fill-current text-slate-700"
                            >
                                {value.toLocaleString('id-ID')}
                            </text>
                            <text
                                x={x + barWidth / 2}
                                y={chartHeight - 5}
                                textAnchor="middle"
                                className="text-xs fill-current text-slate-500"
                            >
                                {data.labels[index]}
                            </text>
                        </g>
                    );
                })}
                 <line x1="0" y1={chartHeight - 20} x2={chartWidth} y2={chartHeight - 20} className="stroke-current text-slate-300" strokeWidth="1"/>
            </svg>
        </div>
    );
};

export default BarChart;