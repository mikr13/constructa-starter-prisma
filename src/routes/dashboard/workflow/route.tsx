import { createFileRoute } from '@tanstack/react-router'
import { Workflow,
  Plus,
  Play,
  Pause,
  Save,
  Settings,
  GitBranch,
  CheckCircle,
  Circle,
  Clock,
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Progress } from '~/components/ui/progress';
import { } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/workflow')({
  component: RouteComponent,
});

function RouteComponent() {
  // Mock workflow data
  const workflows = [
    {
      id: 1,
      name: 'Customer Onboarding',
      status: 'active',
      lastRun: '2 hours ago',
      successRate: 95,
      runs: 1234,
      steps: 5,
    },
    {
      id: 2,
      name: 'Data Processing Pipeline',
      status: 'paused',
      lastRun: '1 day ago',
      successRate: 88,
      runs: 567,
      steps: 8,
    },
    {
      id: 3,
      name: 'Email Marketing Campaign',
      status: 'active',
      lastRun: '30 minutes ago',
      successRate: 92,
      runs: 2345,
      steps: 4,
    },
    {
      id: 4,
      name: 'Report Generation',
      status: 'inactive',
      lastRun: '1 week ago',
      successRate: 100,
      runs: 89,
      steps: 3,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3" />;
      case 'paused':
        return <Clock className="h-3 w-3" />;
      case 'inactive':
        return <Circle className="h-3 w-3" />;
      default:
        return <Circle className="h-3 w-3" />;
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workflow Automation</h1>
            <p className="text-muted-foreground">
              Design, manage, and monitor your automated workflows.
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Workflow
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
              <Workflow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">2 created this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4,235</div>
              <p className="text-xs text-muted-foreground">+22% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">93.5%</div>
              <p className="text-xs text-muted-foreground">+2.1% improvement</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">126h</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="my-workflows" className="space-y-4">
          <TabsList>
            <TabsTrigger value="my-workflows">My Workflows</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="execution-history">Execution History</TabsTrigger>
          </TabsList>

          <TabsContent value="my-workflows" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {workflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <GitBranch className="h-5 w-5" />
                          {workflow.name}
                        </CardTitle>
                        <CardDescription>
                          {workflow.steps} steps • Last run {workflow.lastRun}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className={getStatusColor(workflow.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(workflow.status)}
                          {workflow.status}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Success Rate</span>
                        <span className="font-medium">{workflow.successRate}%</span>
                      </div>
                      <Progress value={workflow.successRate} className="h-2" />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Total Runs: {workflow.runs}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                        {workflow.status === 'active' ? (
                          <Button size="sm" variant="secondary">
                            <Pause className="h-3 w-3 mr-1" />
                            Pause
                          </Button>
                        ) : (
                          <Button size="sm">
                            <Play className="h-3 w-3 mr-1" />
                            Run
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Templates</CardTitle>
                <CardDescription>
                  Start with pre-built templates to accelerate your automation
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
                Template gallery would be displayed here
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="execution-history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Execution History</CardTitle>
                <CardDescription>
                  View detailed logs and history of workflow executions
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
                Execution history timeline would be displayed here
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Workflow Builder</CardTitle>
            <CardDescription>
              Drag and drop to create your custom automation workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
            <div className="text-center">
              <Workflow className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Visual workflow builder would be displayed here</p>
              <Button className="mt-4" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Start Building
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
