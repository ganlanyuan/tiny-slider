'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useWorkspace } from '@/components/workspace';
import { formatMonth } from '@/lib/utils';

const PALETTE = [
  '#0c88eb',
  '#db6e2c',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#0ea5e9',
  '#64748b',
  '#ec4899',
];

const axisStyle = { fontSize: 11, fill: 'rgb(var(--text-muted))' };

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string }[];
  label?: string | number;
}) {
  const { money } = useWorkspace();
  if (!active || !payload?.length) return null;
  return (
    <div className="surface rounded-xl border px-3 py-2 text-xs shadow-lift">
      {label !== undefined ? (
        <p className="mb-1.5 font-medium">
          {typeof label === 'string' && /^\d{4}-\d{2}$/.test(label) ? formatMonth(label) : label}
        </p>
      ) : null}
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: entry.color }}
            aria-hidden
          />
          <span className="muted">{entry.name}</span>
          <span className="tabular ml-auto font-medium">{money(entry.value ?? 0)}</span>
        </p>
      ))}
    </div>
  );
}

export interface TrendPoint {
  month: string;
  revenue: number;
  expense: number;
  profit?: number;
}

/** Revenue against expense (and profit for the owner) over recent months. */
export function TrendChart({ data, showProfit }: { data: TrendPoint[]; showProfit?: boolean }) {
  const { moneyShort } = useWorkspace();
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0c88eb" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#0c88eb" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#db6e2c" stopOpacity={0.26} />
              <stop offset="100%" stopColor="#db6e2c" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.26} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-subtle))" vertical={false} />
          <XAxis
            dataKey="month"
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
            tickFormatter={(m: string) => formatMonth(m).slice(0, 3)}
          />
          <YAxis
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
            width={62}
            tickFormatter={(v: number) => moneyShort(v)}
          />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#0c88eb"
            strokeWidth={2}
            fill="url(#gRevenue)"
          />
          <Area
            type="monotone"
            dataKey="expense"
            name="Expense"
            stroke="#db6e2c"
            strokeWidth={2}
            fill="url(#gExpense)"
          />
          {showProfit ? (
            <Area
              type="monotone"
              dataKey="profit"
              name="Net profit"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#gProfit)"
            />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Expense split by category. */
export function ExpenseDonut({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="grid h-56 place-items-center text-sm muted">
        No expenses recorded for this month.
      </div>
    );
  }
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="56%"
            outerRadius="86%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, color: 'rgb(var(--text-muted))' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Horizontal comparison of SR performance. */
export function SrBarChart({
  data,
}: {
  data: { name: string; soldValue: number; collected: number }[];
}) {
  const { moneyShort } = useWorkspace();
  if (data.length === 0) {
    return <div className="grid h-56 place-items-center text-sm muted">No sales this month.</div>;
  }
  return (
    <div style={{ height: Math.max(200, data.length * 46) }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgb(var(--border-subtle))"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => moneyShort(v)}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
            width={96}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgb(12 136 235 / 0.06)' }} />
          <Bar dataKey="soldValue" name="Sold" fill="#0c88eb" radius={[0, 6, 6, 0]} barSize={12} />
          <Bar
            dataKey="collected"
            name="Collected"
            fill="#10b981"
            radius={[0, 6, 6, 0]}
            barSize={12}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
