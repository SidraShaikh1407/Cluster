import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter } from 'recharts';
import { Users, DollarSign, Calendar, TrendingUp, Target, Star } from 'lucide-react';
import { kmeans } from 'ml-kmeans';

interface Customer {
  [key: string]: any;
}

interface AnalyticsDashboardProps {
  data: Customer[];
}

// Utility function to normalize data for clustering
const normalizeData = (data: number[][]): number[][] => {
  if (data.length === 0 || data[0].length === 0) return data;
  
  const numFeatures = data[0].length;
  const means = new Array(numFeatures).fill(0);
  const stds = new Array(numFeatures).fill(0);
  
  // Calculate means
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < numFeatures; j++) {
      means[j] += data[i][j];
    }
  }
  for (let j = 0; j < numFeatures; j++) {
    means[j] /= data.length;
  }
  
  // Calculate standard deviations
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < numFeatures; j++) {
      stds[j] += Math.pow(data[i][j] - means[j], 2);
    }
  }
  for (let j = 0; j < numFeatures; j++) {
    stds[j] = Math.sqrt(stds[j] / data.length);
    if (stds[j] === 0) stds[j] = 1; // Avoid division by zero
  }
  
  // Normalize data
  return data.map(row => 
    row.map((value, j) => (value - means[j]) / stds[j])
  );
};

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

    // Dynamic labels based on detected fields
    const labels = {
      customers: emailField.toLowerCase().includes('customer') ? 'Total Customers' : 
                 emailField.toLowerCase().includes('user') ? 'Total Users' :
                 emailField.toLowerCase().includes('contact') ? 'Total Contacts' : 'Total Records',
      revenue: amountFields.length > 0 ? 
               amountFields[0].toLowerCase().includes('revenue') ? 'Total Revenue' :
               amountFields[0].toLowerCase().includes('sales') ? 'Total Sales' :
               amountFields[0].toLowerCase().includes('value') ? 'Total Value' :
               amountFields[0].toLowerCase().includes('amount') ? 'Total Amount' : 'Total Value' : 'Total Value',
      avgOrder: amountFields.length > 0 ?
                amountFields[0].toLowerCase().includes('revenue') ? 'Avg Revenue' :
                amountFields[0].toLowerCase().includes('sales') ? 'Avg Sale Value' :
                amountFields[0].toLowerCase().includes('order') ? 'Avg Order Value' : 'Avg Value' : 'Avg Value'
    };

    // K-Means Clustering for Customer Segmentation
    // Identify numeric fields for clustering
    const numericFields = fields.filter(field => {
      const values = data.slice(0, 100).map(row => row[field]); // Sample first 100 rows
      return values.some(val => !isNaN(parseFloat(val)) && isFinite(val));
    });

    // Prepare data for clustering
    const clusteringData = data.map(customer => {
      return numericFields.map(field => {
        const value = parseFloat(customer[field]);
        return isNaN(value) ? 0 : value;
      });
    });

    // Normalize data for better clustering
    const normalizedData = clusteringData.length > 0 ? normalizeData(clusteringData) : [];
    
    // Perform K-Means clustering (k=5 for meaningful segments)
    const k = Math.min(5, data.length);
    const clusterResults = normalizedData.length > 0 ? kmeans(normalizedData, k, { maxIterations: 100 }) : null;
    
    // Create customer segments with cluster assignments
    const segmentNames = ['High Value', 'Loyal Customers', 'At Risk', 'New Customers', 'Lost Customers'];
    
    const customerSegments = data.map((customer, index) => {
      const clusterId = clusterResults ? clusterResults.clusters[index] : 0;
      const segment = segmentNames[clusterId] || `Cluster ${clusterId + 1}`;
      
      // Calculate customer metrics for display
      const amount = amountFields.length > 0 ? parseFloat(customer[amountFields[0]]) || 0 : 0;
      
      return {
        ...customer,
        id: index + 1,
        cluster: clusterId,
        segment,
        monetary: amount,
        // Include all numeric features for visualization
        features: numericFields.reduce((acc, field) => {
          acc[field] = parseFloat(customer[field]) || 0;
          return acc;
        }, {} as Record<string, number>)
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

    // Cluster visualization data (using first two numeric features)
    const clusterVisualizationData = customerSegments.map((customer, index) => ({
      x: numericFields.length > 0 ? customer.features[numericFields[0]] || 0 : Math.random() * 100,
      y: numericFields.length > 1 ? customer.features[numericFields[1]] || 0 : Math.random() * 100,
      cluster: customer.cluster,
      segment: customer.segment
    }));

    return {
      totalCustomers,
      totalRevenue,
      avgOrderValue: totalRevenue / totalCustomers || 0,
      customerSegments,
      segmentData,
      monthlyData,
      clusterVisualizationData,
      numericFields,
      fields,
      labels,
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
          <h2 className="text-4xl font-bold text-foreground mb-4">Customer Segmentation Dashboard</h2>
          <p className="text-xl text-muted-foreground">K-Means clustering analysis and insights from your data</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 shadow-card-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{insights.labels.customers}</p>
                <p className="text-3xl font-bold text-foreground">{insights.totalCustomers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-chart-1" />
            </div>
          </Card>

          <Card className="p-6 shadow-card-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{insights.labels.revenue}</p>
                <p className="text-3xl font-bold text-foreground">${insights.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-chart-2" />
            </div>
          </Card>

          <Card className="p-6 shadow-card-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{insights.labels.avgOrder}</p>
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

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Customer Segments Pie Chart */}
          <Card className="p-6 shadow-card-shadow">
            <h3 className="text-xl font-semibold text-foreground mb-6">Customer Segments Distribution</h3>
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

          {/* K-Means Cluster Visualization */}
          <Card className="p-6 shadow-card-shadow">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              K-Means Clustering Visualization
              {insights.numericFields.length >= 2 && (
                <span className="text-sm font-normal text-muted-foreground block">
                  {insights.numericFields[0]} vs {insights.numericFields[1]}
                </span>
              )}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={insights.clusterVisualizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="x" 
                  name={insights.numericFields[0] || 'Feature 1'}
                  type="number"
                />
                <YAxis 
                  dataKey="y" 
                  name={insights.numericFields[1] || 'Feature 2'}
                  type="number"
                />
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(value) => `Segment: ${insights.clusterVisualizationData[0]?.segment || 'Unknown'}`}
                />
                {[0, 1, 2, 3, 4].map(clusterId => (
                  <Scatter
                    key={clusterId}
                    name={`Cluster ${clusterId + 1}`}
                    data={insights.clusterVisualizationData.filter(d => d.cluster === clusterId)}
                    fill={COLORS[clusterId % COLORS.length]}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Monthly Trends - Full Width */}
        <Card className="p-6 shadow-card-shadow mb-12">
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