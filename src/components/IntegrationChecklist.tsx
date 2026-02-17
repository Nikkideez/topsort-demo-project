/**
 * Integration Checklist
 * Visual progress tracker showing integration status
 */

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Zap,
  Eye,
  MousePointer,
  ShoppingCart,
  Activity,
  Code2,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalyticsData } from '@/context/TopsortContext';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  check: (analytics: AnalyticsData, isInitialized: boolean) => boolean;
  codeHint: string;
  docsUrl?: string;
}

const checklistItems: ChecklistItem[] = [
  {
    id: 'init',
    title: 'Initialize SDK',
    description: 'Set up the Topsort client with API credentials',
    icon: Code2,
    check: (_, isInitialized) => isInitialized,
    codeHint: 'TopsortClient({ apiKey })',
    docsUrl: 'https://docs.topsort.com/ad-platform/sdks/javascript-sdk/',
  },
  {
    id: 'auction',
    title: 'Run First Auction',
    description: 'Request sponsored product placements',
    icon: Zap,
    check: (analytics) => analytics.impressions > 0 || analytics.adSpend > 0,
    codeHint: 'client.runAuction({ auctions: [...] })',
    docsUrl: 'https://docs.topsort.com/auctions/',
  },
  {
    id: 'impression',
    title: 'Track Impressions',
    description: 'Fire impression events when ads are displayed',
    icon: Eye,
    check: (analytics) => analytics.impressions > 0,
    codeHint: 'client.trackEvent({ type: "impression" })',
    docsUrl: 'https://docs.topsort.com/events/',
  },
  {
    id: 'viewability',
    title: 'Track Viewability',
    description: 'IAB standard: 50% visible for 1+ second',
    icon: Activity,
    check: (analytics) => analytics.viewableImpressions > 0,
    codeHint: 'client.trackEvent({ type: "viewability" })',
    docsUrl: 'https://docs.topsort.com/events/',
  },
  {
    id: 'click',
    title: 'Track Clicks',
    description: 'Fire click events on user interaction',
    icon: MousePointer,
    check: (analytics) => analytics.clicks > 0,
    codeHint: 'client.trackEvent({ type: "click" })',
    docsUrl: 'https://docs.topsort.com/events/',
  },
  {
    id: 'purchase',
    title: 'Track Conversions',
    description: 'Attribute purchases back to ad clicks',
    icon: ShoppingCart,
    check: (analytics) => analytics.purchases > 0,
    codeHint: 'client.trackEvent({ type: "purchase" })',
    docsUrl: 'https://docs.topsort.com/events/',
  },
];

interface IntegrationChecklistProps {
  analytics: AnalyticsData;
  isInitialized: boolean;
}

export function IntegrationChecklist({ analytics, isInitialized }: IntegrationChecklistProps) {
  const completedSteps = useMemo(() => {
    return checklistItems.filter(item => item.check(analytics, isInitialized)).length;
  }, [analytics, isInitialized]);

  const progress = Math.round((completedSteps / checklistItems.length) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Integration Checklist</CardTitle>
            <CardDescription>Complete these steps for a full integration</CardDescription>
          </div>
          <Badge variant={progress === 100 ? 'default' : 'secondary'} className="text-sm">
            {completedSteps}/{checklistItems.length} Complete
          </Badge>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500",
              progress === 100 ? "bg-green-500" : "bg-primary"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {checklistItems.map((item, index) => {
          const isComplete = item.check(analytics, isInitialized);
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg transition-colors",
                isComplete ? "bg-green-50" : "bg-muted/30"
              )}
            >
              {/* Status icon */}
              <div className={cn(
                "mt-0.5 shrink-0",
                isComplete ? "text-green-600" : "text-muted-foreground"
              )}>
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon className={cn(
                    "h-4 w-4",
                    isComplete ? "text-green-600" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "font-medium text-sm",
                    isComplete && "text-green-700"
                  )}>
                    {item.title}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-background px-1.5 py-0.5 rounded text-muted-foreground">
                    {item.codeHint}
                  </code>
                  {item.docsUrl && (
                    <a
                      href={item.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Docs
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Arrow to next */}
              {index < checklistItems.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground/30 shrink-0 mt-1" />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
