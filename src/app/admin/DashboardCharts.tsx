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
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #7c2d12', borderRadius: '0' }}
            itemStyle={{ color: '#7c2d12', fontWeight: 'bold' }}
            formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Income']}
          />
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
            formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
          />
          <Legend iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
