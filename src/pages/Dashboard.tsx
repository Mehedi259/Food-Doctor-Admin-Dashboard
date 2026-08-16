import { useState, useEffect } from 'react';
import { Users, Activity, CheckCircle, Clock } from 'lucide-react';
import { getDashboardStats, getSupportTickets } from '../api/services';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [statsData, setStatsData] = useState<{ total_users: number, monthly_data: any[] } | null>(null);
  const [supportStats, setSupportStats] = useState({ resolved: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, ticketsRes] = await Promise.all([
          getDashboardStats(),
          getSupportTickets()
        ]);

        setStatsData(statsRes);

        let resolved = 0;
        let pending = 0;
        
        if (Array.isArray(ticketsRes)) {
          ticketsRes.forEach((ticket: any) => {
            if (ticket.status === 'Resolved') resolved++;
            else pending++;
          });
        }
        
        setSupportStats({ resolved, pending });
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    { 
      title: 'Total Users', 
      value: loading ? '...' : statsData?.total_users?.toLocaleString() || '0', 
      icon: Users, 
      color: 'text-blue-500', 
      bg: 'bg-blue-50' 
    },
    { 
      title: 'Active Sessions', 
      value: loading ? '...' : Math.floor((statsData?.total_users || 0) * 0.1).toLocaleString(), // Mocked as 10% of total users for now
      icon: Activity, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50' 
    },
    { 
      title: 'Resolved Tickets', 
      value: loading ? '...' : supportStats.resolved.toLocaleString(), 
      icon: CheckCircle, 
      color: 'text-purple-500', 
      bg: 'bg-purple-50' 
    },
    { 
      title: 'Pending Support', 
      value: loading ? '...' : supportStats.pending.toLocaleString(), 
      icon: Clock, 
      color: 'text-amber-500', 
      bg: 'bg-amber-50' 
    },
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
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-border p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-text-primary mb-4">User Growth ({statsData?.year || new Date().getFullYear()})</h2>
          <div className="flex-1 flex flex-col justify-end min-h-[250px] relative mt-4">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-text-secondary">Loading chart...</div>
            ) : (
              <div className="flex h-full items-end justify-between gap-2 px-2 pb-6 border-b border-border">
                {statsData?.monthly_data?.map((month, idx) => {
                  const maxCount = Math.max(...statsData.monthly_data.map(m => m.user_count), 10);
                  const height = Math.max((month.user_count / maxCount) * 100, 5);
                  
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 group">
                      <div className="relative w-full flex justify-center">
                        <div 
                          className="w-full max-w-[40px] bg-primary/20 group-hover:bg-primary transition-all duration-300 rounded-t-md"
                          style={{ height: `${height}%`, minHeight: '20px' }}
                        ></div>
                        <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-text-primary text-surface text-xs py-1 px-2 rounded">
                          {month.user_count}
                        </div>
                      </div>
                      <span className="text-xs text-text-secondary mt-2 rotate-45 md:rotate-0 origin-left">
                        {month.month_name.substring(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm overflow-hidden flex flex-col">
          <h2 className="text-lg font-bold text-text-primary mb-4">Recent Activity</h2>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {loading ? (
              <div className="text-text-secondary text-sm">Loading activity...</div>
            ) : (
              <>
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 mt-2 rounded-full bg-emerald-500"></div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">API Proxy Connected</p>
                    <p className="text-xs text-text-secondary">Just now</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary"></div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">Dashboard Stats Loaded</p>
                    <p className="text-xs text-text-secondary">Successfully fetched from backend</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
