import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Factory, ShoppingCart, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Orders',
      value: '156',
      icon: ShoppingCart,
      change: '+12%',
      color: 'text-primary',
    },
    {
      title: 'Active Factories',
      value: '24',
      icon: Factory,
      change: '+3%',
      color: 'text-secondary',
    },
    {
      title: 'Team Members',
      value: '48',
      icon: Users,
      change: '+8%',
      color: 'text-accent',
    },
    {
      title: 'Production Rate',
      value: '94%',
      icon: TrendingUp,
      change: '+5%',
      color: 'text-primary',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening with your production today.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-primary font-medium">{stat.change}</span> from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New order received</p>
                    <p className="text-xs text-muted-foreground">Order #1234 - 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Production completed</p>
                    <p className="text-xs text-muted-foreground">Order #1233 - 4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New team member added</p>
                    <p className="text-xs text-muted-foreground">John Doe - 6 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 rounded-lg bg-muted hover:bg-primary/10 transition-colors">
                  <p className="text-sm font-medium">Create New Order</p>
                  <p className="text-xs text-muted-foreground">Start a new production order</p>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg bg-muted hover:bg-primary/10 transition-colors">
                  <p className="text-sm font-medium">Add Factory</p>
                  <p className="text-xs text-muted-foreground">Register a new manufacturing unit</p>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg bg-muted hover:bg-primary/10 transition-colors">
                  <p className="text-sm font-medium">Invite Team Member</p>
                  <p className="text-xs text-muted-foreground">Add a new user to your team</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
