/**
 * Integration Dashboard
 * Real-time monitoring with conversion funnel, charts, and ROAS metrics
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  Cell,
  AreaChart,
  Area,
  PieChart,
  Pie,
} from 'recharts';
import {
  Activity,
  Zap,
  Eye,
  MousePointer,
  ShoppingCart,
  CheckCircle2,
  Trash2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  DollarSign,
  Target,
} from 'lucide-react';
import { useTopsortContext } from '@/context/TopsortContext';
import { IntegrationChecklist } from '@/components/IntegrationChecklist';
import { RequestInspector } from '@/components/RequestInspector';
import { cn } from '@/lib/utils';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Funnel colors
const FUNNEL_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#06b6d4'];

function ConversionFunnel({ analytics }: { analytics: ReturnType<typeof useTopsortContext>['analytics'] }) {
  const funnelData = useMemo(() => {
    const { impressions, viewableImpressions, clicks, addToCarts, purchases } = analytics;

    // Calculate conversion rates
    const viewabilityRate = impressions > 0 ? (viewableImpressions / impressions) * 100 : 0;
    const ctr = viewableImpressions > 0 ? (clicks / viewableImpressions) * 100 : 0;
    const addToCartRate = clicks > 0 ? (addToCarts / clicks) * 100 : 0;
    const purchaseRate = addToCarts > 0 ? (purchases / addToCarts) * 100 : 0;

    return [
      { name: 'Impressions', value: impressions, fill: FUNNEL_COLORS[0], rate: 100 },
      { name: 'Viewable', value: viewableImpressions, fill: FUNNEL_COLORS[1], rate: viewabilityRate },
      { name: 'Clicks', value: clicks, fill: FUNNEL_COLORS[2], rate: ctr },
      { name: 'Add to Cart', value: addToCarts, fill: FUNNEL_COLORS[3], rate: addToCartRate },
      { name: 'Purchases', value: purchases, fill: FUNNEL_COLORS[4], rate: purchaseRate },
    ];
  }, [analytics]);

  const hasData = funnelData.some(d => d.value > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Target className="h-12 w-12 mb-4 opacity-30" />
        <p className="text-lg font-medium">No funnel data yet</p>
        <p className="text-sm">Browse the catalog to generate events</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Visual Funnel */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Tooltip
              content={({ payload }) => {
                if (!payload?.[0]) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-background border rounded-lg shadow-lg p-3">
                    <p className="font-medium">{data.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Count: <span className="font-medium text-foreground">{data.value}</span>
                    </p>
                  </div>
                );
              }}
            />
            <Funnel
              dataKey="value"
              data={funnelData}
              isAnimationActive
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              <LabelList
                position="center"
                fill="#fff"
                stroke="none"
                dataKey="value"
              />
              {funnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>

      {/* Funnel Steps with Conversion Rates */}
      <div className="grid gap-2">
        {funnelData.map((step, index) => (
          <div key={step.name} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: step.fill }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{step.name}</span>
                <span className="text-sm font-bold">{step.value}</span>
              </div>
              {index > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={step.rate} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {formatPercent(step.rate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ROASCalculator({ analytics }: { analytics: ReturnType<typeof useTopsortContext>['analytics'] }) {
  const { attributedRevenue, organicRevenue, adSpend } = analytics;
  const totalRevenue = attributedRevenue + organicRevenue;

  // ROAS only uses attributed revenue (from sponsored product purchases)
  const roas = adSpend > 0 ? attributedRevenue / adSpend : 0;
  const attributedProfit = attributedRevenue - adSpend;

  return (
    <div className="space-y-6">
      {/* Main ROAS Display */}
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground mb-2">Return on Ad Spend</p>
        <div className="flex items-center justify-center gap-2">
          <span className={cn(
            "text-5xl font-bold",
            roas >= 4 ? "text-green-600" :
            roas >= 2 ? "text-yellow-600" :
            roas > 0 ? "text-orange-600" : "text-muted-foreground"
          )}>
            {roas.toFixed(2)}x
          </span>
          {roas >= 4 && <TrendingUp className="h-8 w-8 text-green-600" />}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {roas >= 4 ? "Excellent performance!" :
           roas >= 2 ? "Good performance" :
           roas > 0 ? "Room for improvement" : "No ad-attributed revenue yet"}
        </p>
      </div>

      <Separator />

      {/* Metrics Grid */}
      <div className="grid gap-4 grid-cols-2">
        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center gap-2 text-green-700 mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">Attributed Revenue</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(attributedRevenue)}</p>
          <p className="text-xs text-green-600 mt-1">From sponsored products</p>
        </div>

        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2 text-blue-700 mb-1">
            <Target className="h-4 w-4" />
            <span className="text-sm font-medium">Ad Spend</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{formatCurrency(adSpend)}</p>
          <p className="text-xs text-blue-600 mt-1">Cost per click × clicks</p>
        </div>

        <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
          <div className="flex items-center gap-2 text-purple-700 mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Ad Profit</span>
          </div>
          <p className={cn(
            "text-2xl font-bold",
            attributedProfit >= 0 ? "text-purple-700" : "text-red-600"
          )}>
            {formatCurrency(attributedProfit)}
          </p>
          <p className="text-xs text-purple-600 mt-1">Attributed - Spend</p>
        </div>

        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-700 mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">Organic Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-700">{formatCurrency(organicRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">Non-sponsored products</p>
        </div>
      </div>

      {/* Total Revenue Summary */}
      {totalRevenue > 0 && (
        <div className="pt-2 border-t text-center">
          <p className="text-sm text-muted-foreground">
            Total Revenue: <span className="font-semibold text-foreground">{formatCurrency(totalRevenue)}</span>
            {' '}({((attributedRevenue / totalRevenue) * 100).toFixed(0)}% attributed)
          </p>
        </div>
      )}
    </div>
  );
}

function EventTimeline({ analytics }: { analytics: ReturnType<typeof useTopsortContext>['analytics'] }) {
  const chartData = useMemo(() => {
    const { eventTimeline } = analytics;
    if (eventTimeline.length === 0) return [];

    // Group events by 5-second intervals
    const buckets: Record<string, { time: string; impression: number; viewability: number; click: number; addToCart: number; purchase: number }> = {};

    eventTimeline.forEach(event => {
      const time = new Date(event.timestamp);
      const bucketKey = `${time.getHours()}:${time.getMinutes()}:${Math.floor(time.getSeconds() / 5) * 5}`;

      if (!buckets[bucketKey]) {
        buckets[bucketKey] = {
          time: bucketKey,
          impression: 0,
          viewability: 0,
          click: 0,
          addToCart: 0,
          purchase: 0,
        };
      }
      // Increment the event type counter
      const eventType = event.type as keyof typeof buckets[string];
      if (eventType !== 'time') {
        buckets[bucketKey][eventType]++;
      }
    });

    return Object.values(buckets).slice(-20); // Last 20 buckets
  }, [analytics]);

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Activity className="h-12 w-12 mb-4 opacity-30" />
        <p className="text-lg font-medium">No events yet</p>
        <p className="text-sm">Events will appear as you interact with products</p>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="time" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            content={({ payload, label }) => {
              if (!payload?.length) return null;
              return (
                <div className="bg-background border rounded-lg shadow-lg p-3">
                  <p className="font-medium mb-2">{label}</p>
                  {payload.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="capitalize">{entry.name}:</span>
                      <span className="font-medium">{entry.value}</span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <Area type="monotone" dataKey="impression" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
          <Area type="monotone" dataKey="viewability" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
          <Area type="monotone" dataKey="click" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
          <Area type="monotone" dataKey="addToCart" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
          <Area type="monotone" dataKey="purchase" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function EventBreakdown({ analytics }: { analytics: ReturnType<typeof useTopsortContext>['analytics'] }) {
  const data = [
    { name: 'Impressions', value: analytics.impressions, color: '#3b82f6' },
    { name: 'Viewable', value: analytics.viewableImpressions, color: '#8b5cf6' },
    { name: 'Clicks', value: analytics.clicks, color: '#f59e0b' },
    { name: 'Add to Cart', value: analytics.addToCarts, color: '#10b981' },
    { name: 'Purchases', value: analytics.purchases, color: '#06b6d4' },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ payload }) => {
              if (!payload?.[0]) return null;
              const data = payload[0].payload;
              return (
                <div className="bg-background border rounded-lg shadow-lg p-2">
                  <p className="text-sm font-medium">{data.name}: {data.value}</p>
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const {
    apiLogs,
    analytics,
    clearLogs,
    clearAnalytics,
    setErrorSimulation,
    isInitialized,
    initialize,
    runAuction,
  } = useTopsortContext();

  const [errorSimEnabled, setErrorSimEnabled] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      initialize('demo_api_key_xxxxx');
    }
  }, [isInitialized, initialize]);

  const handleToggleErrorSim = () => {
    const newValue = !errorSimEnabled;
    setErrorSimEnabled(newValue);
    setErrorSimulation(newValue);
  };

  const handleTestAuction = async () => {
    try {
      await runAuction({
        auctions: [{
          type: 'listings',
          slots: 3,
        }],
      });
    } catch {
      // Error is logged via context
    }
  };

  const handleClearAll = () => {
    clearLogs();
    clearAnalytics();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integration Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time analytics, conversion funnel, and ROAS metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/catalog')} variant="outline">
            View Catalog
          </Button>
          <Button onClick={handleTestAuction}>
            <Zap className="h-4 w-4 mr-2" />
            Test Auction
          </Button>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Eye className="h-8 w-8 text-blue-500" />
              <div className="text-right">
                <p className="text-2xl font-bold">{analytics.impressions}</p>
                <p className="text-xs text-muted-foreground">Impressions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <CheckCircle2 className="h-8 w-8 text-purple-500" />
              <div className="text-right">
                <p className="text-2xl font-bold">{analytics.viewableImpressions}</p>
                <p className="text-xs text-muted-foreground">Viewable</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <MousePointer className="h-8 w-8 text-orange-500" />
              <div className="text-right">
                <p className="text-2xl font-bold">{analytics.clicks}</p>
                <p className="text-xs text-muted-foreground">Clicks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <ShoppingCart className="h-8 w-8 text-green-500" />
              <div className="text-right">
                <p className="text-2xl font-bold">{analytics.addToCarts}</p>
                <p className="text-xs text-muted-foreground">Add to Cart</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <DollarSign className="h-8 w-8 text-emerald-500" />
              <div className="text-right">
                <p className="text-2xl font-bold">{analytics.purchases}</p>
                <p className="text-xs text-muted-foreground">Purchases</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Conversion Funnel
            </CardTitle>
            <CardDescription>
              Track user journey from impression to purchase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConversionFunnel analytics={analytics} />
          </CardContent>
        </Card>

        {/* ROAS Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              ROAS & Revenue
            </CardTitle>
            <CardDescription>
              Return on ad spend and revenue metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ROASCalculator analytics={analytics} />
          </CardContent>
        </Card>
      </div>

      {/* Event Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Event Timeline
          </CardTitle>
          <CardDescription>
            Real-time event stream visualization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventTimeline analytics={analytics} />
        </CardContent>
      </Card>

      {/* Integration Checklist & Controls */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Integration Checklist */}
        <IntegrationChecklist analytics={analytics} isInitialized={isInitialized} />

        {/* Demo Controls & Event Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Events & Controls</CardTitle>
            <CardDescription>Event breakdown and demo controls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Event Summary */}
              <div className="space-y-4">
                <EventBreakdown analytics={analytics} />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                    <span>Impressions: {analytics.impressions}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
                    <span>Viewable: {analytics.viewableImpressions}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                    <span>Clicks: {analytics.clicks}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                    <span>Add to Cart: {analytics.addToCarts}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <div className="w-3 h-3 rounded-full bg-[#06b6d4]" />
                    <span>Purchases: {analytics.purchases}</span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm">Error Simulation</p>
                    <p className="text-xs text-muted-foreground">
                      Randomly fail 30% of API calls
                    </p>
                  </div>
                  <Button
                    variant={errorSimEnabled ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={handleToggleErrorSim}
                  >
                    {errorSimEnabled ? (
                      <ToggleRight className="h-4 w-4" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleTestAuction}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Run Test Auction
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/catalog')}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Go to Catalog
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleClearAll}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Request Inspector */}
      <RequestInspector logs={apiLogs} onClear={clearLogs} />
    </div>
  );
}
