import { Users, Activity, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { title: 'Total Users', value: '12,450', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Active Sessions', value: '1,234', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'Resolved Tickets', value: '892', icon: CheckCircle, color: 'text-purple-500', bg: 'bg-purple-50' },
    { title: 'Pending Support', value: '45', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard Overview</h1>
        <p className="text-text-secondary mt-1">Welcome back, here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">{stat.title}</p>
                <p className="text-3xl font-bold text-text-primary mt-2">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-text-primary mb-4">User Growth</h2>
          <div className="h-64 flex items-center justify-center bg-background rounded-xl border border-border/50 text-text-secondary">
            [Chart Placeholder]
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-text-primary mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="h-2 w-2 mt-2 rounded-full bg-primary"></div>
                <div>
                  <p className="text-sm font-medium text-text-primary">New user registered</p>
                  <p className="text-xs text-text-secondary">2 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
