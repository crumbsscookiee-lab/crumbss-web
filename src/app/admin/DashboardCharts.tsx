'use client';

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';

const COLORS = ['#7c2d12', '#ea580c', '#9a3412', '#c2410c', '#fb923c']; // Custom palette matching the brand

interface DailyData {
  date: string;
  income: number;
}

interface ProductData {
  name: string;
  sales: number;
}

interface FinancialData {
  name: string;
  value: number;
}

const CustomTooltip = ({ active, payload, label, data, dataKey, valuePrefix = '', valueLabel = 'Value' }: any) => {
  if (active && payload && payload.length) {
    const currentIndex = data.findIndex((d: any) => d.date === label);
    const currentValue = payload[0].value;
    let percentChange = null;

    if (currentIndex > 0) {
      const prevValue = data[currentIndex - 1][dataKey];
      if (prevValue > 0) {
        percentChange = ((currentValue - prevValue) / prevValue) * 100;
      } else if (prevValue === 0 && currentValue > 0) {
        percentChange = 100;
      } else {
        percentChange = 0;
      }
    }

    return (
      <div className="bg-background border border-primary p-3 shadow-lg min-w-[150px]">
        <p className="font-bold text-primary mb-2 border-b border-primary/20 pb-1">{label}</p>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center gap-4">
            <span className="text-xs text-primary/60 uppercase tracking-widest">{valueLabel}</span>
            <span className="text-accent font-bold">
              {valuePrefix}{Number(currentValue).toLocaleString('id-ID')}
            </span>
          </div>
          {percentChange !== null && (
            <div className={`flex justify-between items-center gap-4 mt-1 pt-1 border-t border-primary/10`}>
              <span className="text-[10px] text-primary/40 uppercase tracking-widest">Growth</span>
              <span className={`text-xs font-bold ${percentChange >= 0 ? 'text-green-600' : 'text-danger'}`}>
                {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function DailyTrendChart({ data }: { data: DailyData[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#7c2d12', fontSize: 12, fontWeight: 'bold' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#7c2d12', fontSize: 12 }} 
            tickFormatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
            width={80}
          />
          <Tooltip content={<CustomTooltip data={data} dataKey="income" valuePrefix="Rp " valueLabel="Income" />} />
          <Line 
            type="monotone" 
            dataKey="income" 
            stroke="#ea580c" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#ea580c' }} 
            activeDot={{ r: 6, fill: '#7c2d12' }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopProductsChart({ data }: { data: ProductData[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            width={120}
            tick={{ fill: '#7c2d12', fontSize: 11, fontWeight: 'bold' }} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #7c2d12', borderRadius: '0' }}
            cursor={{ fill: '#ea580c10' }}
          />
          <Bar dataKey="sales" fill="#7c2d12" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GeneralLineChart({ data, dataKey, color = "#ea580c", label = "Value" }: { data: any[], dataKey: string, color?: string, label?: string }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#7c2d12', fontSize: 10, fontWeight: 'bold' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#7c2d12', fontSize: 11 }} 
            width={50}
          />
          <Tooltip content={<CustomTooltip data={data} dataKey={dataKey} valueLabel={label} />} />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={3} 
            dot={{ r: 4, fill: color }} 
            activeDot={{ r: 6, fill: '#7c2d12' }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const CustomMultiTooltip = ({ active, payload, label, data, lines }: any) => {
  if (active && payload && payload.length) {
    const currentIndex = data.findIndex((d: any) => d.date === label);
    
    return (
      <div className="bg-background border border-primary p-3 shadow-lg min-w-[200px]">
        <p className="font-bold text-primary mb-2 border-b border-primary/20 pb-1">{label}</p>
        <div className="flex flex-col gap-2">
          {payload.map((entry: any, index: number) => {
            const dataKey = entry.dataKey;
            const currentValue = entry.value;
            let percentChange = null;

            if (currentIndex > 0) {
              const prevValue = data[currentIndex - 1][dataKey];
              if (prevValue > 0) {
                percentChange = ((currentValue - prevValue) / prevValue) * 100;
              } else if (prevValue === 0 && currentValue > 0) {
                percentChange = 100;
              } else {
                percentChange = 0;
              }
            }

            return (
              <div key={index} className="flex justify-between items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-primary/70">{entry.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold" style={{ color: entry.color }}>
                    {Number(currentValue).toLocaleString('id-ID')}
                  </span>
                  {percentChange !== null && (
                    <span className={`text-[10px] w-12 text-right ${percentChange >= 0 ? 'text-green-600' : 'text-danger'}`}>
                      {percentChange > 0 ? '+' : ''}{percentChange.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export function MultiLineChart({ data, lines }: { data: any[], lines: { key: string, color: string, label: string }[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#7c2d12', fontSize: 10, fontWeight: 'bold' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#7c2d12', fontSize: 11 }} 
            width={50}
          />
          <Tooltip content={<CustomMultiTooltip data={data} lines={lines} />} />
          <Legend />
          {lines.map(line => (
            <Line 
              key={line.key}
              type="monotone" 
              dataKey={line.key} 
              name={line.label}
              stroke={line.color} 
              strokeWidth={2} 
              dot={{ r: 3, fill: line.color }} 
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FinancialPieChart({ data }: { data: FinancialData[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any) => `Rp ${Number(value).toLocaleString('id-ID')}`}
          />
          <Legend iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
