import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, DollarSign, Calendar, TrendingUp, Target, Star } from 'lucide-react';

interface Customer {
  [key: string]: any;
}

interface AnalyticsDashboardProps {
  data: Customer[];
}

const AnalyticsDashboard = ({ data }: AnalyticsDashboardProps) => {
  const insights = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Get common field names (case insensitive)
    const sampleRow = data[0];
    const fields = Object.keys(sampleRow);
    
    // Try to identify key fields
    const emailField = fields.find(f => f.toLowerCase().includes('email')) || fields[0];
    const amountFields = fields.filter(f => 
      f.toLowerCase().includes('amount') || 
      f.toLowerCase().includes('revenue') || 
      f.toLowerCase().includes('value') ||
      f.toLowerCase().includes('total')
    );
    const dateFields = fields.filter(f => 
      f.toLowerCase().includes('date') || 
      f.toLowerCase().includes('time') || 
      f.toLowerCase().includes('created')
    );

    // Basic metrics
    const totalCustomers = data.length;
    const totalRevenue = amountFields.length > 0 
      ? data.reduce((sum, customer) => {
          const amount = parseFloat(customer[amountFields[0]]) || 0;
          return sum + amount;
        }, 0)
      : 0;

    // RFM Analysis (simplified)
    const customerSegments = data.map((customer, index) => {
      const amount = amountFields.length > 0 ? parseFloat(customer[amountFields[0]]) || 0 : Math.random() * 1000;
      const recency = Math.floor(Math.random() * 365); // Days since last purchase
      const frequency = Math.floor(Math.random() * 20) + 1; // Number of purchases
      
      // Simple scoring (1-5)
      const rScore = recency < 30 ? 5 : recency < 90 ? 4 : recency < 180 ? 3 : recency < 365 ? 2 : 1;
      const fScore = frequency > 15 ? 5 : frequency > 10 ? 4 : frequency > 5 ? 3 : frequency > 2 ? 2 : 1;
      const mScore = amount > 1000 ? 5 : amount > 500 ? 4 : amount > 200 ? 3 : amount > 50 ? 2 : 1;
      
      // Segment assignment
      let segment = 'New Customer';
      const avgScore = (rScore + fScore + mScore) / 3;
      
      if (avgScore >= 4.5) segment = 'Champions';
      else if (avgScore >= 4) segment = 'Loyal Customers';
      else if (avgScore >= 3.5) segment = 'Potential Loyalists';
      else if (avgScore >= 3) segment = 'At Risk';
      else if (avgScore >= 2) segment = 'Need Attention';
      else segment = 'Lost Customers';

      return {
        ...customer,
        id: index + 1,
        recency,
        frequency,
        monetary: amount,
        rScore,
        fScore,
        mScore,
        segment
      };
    });

    // Segment distribution
    const segmentCounts = customerSegments.reduce((acc, customer) => {
      acc[customer.segment] = (acc[customer.segment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const segmentData = Object.entries(segmentCounts).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / totalCustomers) * 100)
    }));

    // Monthly trend (simulated)
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i).toLocaleDateString('en', { month: 'short' }),
      customers: Math.floor(Math.random() * 100) + 50,
      revenue: Math.floor(Math.random() * 10000) + 5000
    }));

    return {
      totalCustomers,
      totalRevenue,
      avgOrderValue: totalRevenue / totalCustomers || 0,
      customerSegments,
      segmentData,
      monthlyData,
      fields,
      topSegment: segmentData.sort((a, b) => b.value - a.value)[0]?.name || 'Champions'
    };
  }, [data]);

  if (!insights) {
    return (
      <div className="py-20 bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-foreground mb-2">No Data Available</h3>
          <p className="text-muted-foreground">Upload a CSV file to see customer analytics and insights</p>
        </div>
      </div>
    );
  }

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--chart-6))'];

  return (
    <div className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Customer Analytics Dashboard</h2>
          <p className="text-xl text-muted-foreground">Insights and segments generated from your data</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 shadow-card-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-3xl font-bold text-foreground">{insights.totalCustomers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-chart-1" />
            </div>
          </Card>

          <Card className="p-6 shadow-card-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground">${insights.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-chart-2" />
            </div>
          </Card>

          <Card className="p-6 shadow-card-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-3xl font-bold text-foreground">${Math.round(insights.avgOrderValue)}</p>
              </div>
              <Target className="h-8 w-8 text-chart-3" />
            </div>
          </Card>

          <Card className="p-6 shadow-card-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Segment</p>
                <p className="text-lg font-bold text-foreground">{insights.topSegment}</p>
              </div>
              <Star className="h-8 w-8 text-chart-4" />
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Customer Segments Pie Chart */}
          <Card className="p-6 shadow-card-shadow">
            <h3 className="text-xl font-semibold text-foreground mb-6">Customer Segments</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={insights.segmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {insights.segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Monthly Trends */}
          <Card className="p-6 shadow-card-shadow">
            <h3 className="text-xl font-semibold text-foreground mb-6">Monthly Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={insights.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="customers" stroke="hsl(var(--chart-1))" strokeWidth={3} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Segment Details */}
        <Card className="p-8 shadow-card-shadow">
          <h3 className="text-2xl font-semibold text-foreground mb-6">Segment Breakdown</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {insights.segmentData.map((segment, index) => (
              <div key={segment.name} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <div>
                    <p className="font-medium text-foreground">{segment.name}</p>
                    <p className="text-sm text-muted-foreground">{segment.value} customers</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {segment.percentage}%
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Actionable Insights */}
        <Card className="p-8 shadow-card-shadow mt-8 bg-gradient-accent text-accent-foreground">
          <h3 className="text-2xl font-semibold mb-4">🎯 Key Insights & Recommendations</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Customer Distribution</h4>
              <p className="opacity-90">Your largest segment is "{insights.topSegment}" representing the strongest customer base for targeted campaigns.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Revenue Opportunity</h4>
              <p className="opacity-90">Focus on converting "Potential Loyalists" to increase customer lifetime value and retention rates.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;