/**
 * Request Inspector
 * Enhanced API log viewer with code snippets and detailed formatting
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowRight,
  ArrowLeft,
  XCircle,
  Clock,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  FileJson,
  Zap,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ApiLog } from '@/context/TopsortContext';

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });
}

function getCodeSnippet(log: ApiLog): string {
  if (log.type !== 'request') return '';

  const data = log.data as Record<string, unknown>;

  if (log.endpoint === '/auctions') {
    return `// Create auction for sponsored placements
topsortClient.createAuction({
  auctions: ${JSON.stringify(data.auctions || [], null, 2).split('\n').map((l, i) => i === 0 ? l : '  ' + l).join('\n')}
}).then(result => {
  result.results[0].winners.forEach(winner => {
    displaySponsoredProduct(winner.id, winner.resolvedBidId);
  });
});`;
  }

  if (log.endpoint === '/events') {
    const hasImpressions = !!(data as { impressions?: unknown[] }).impressions?.length;
    const hasClicks = !!(data as { clicks?: unknown[] }).clicks?.length;
    const hasPurchases = !!(data as { purchases?: unknown[] }).purchases?.length;

    if (hasImpressions) {
      return `// Report impressions when sponsored products are displayed
topsortClient.reportEvent({
  impressions: [{
    resolvedBidId: winner.resolvedBidId,
    id: crypto.randomUUID(),
    occurredAt: new Date().toISOString(),
    placement: { path: '/catalog/grid' }
  }]
});`;
    }

    if (hasClicks) {
      return `// Report clicks when user interacts with sponsored product
topsortClient.reportEvent({
  clicks: [{
    resolvedBidId: winner.resolvedBidId,
    id: crypto.randomUUID(),
    occurredAt: new Date().toISOString()
  }]
});`;
    }

    if (hasPurchases) {
      return `// Report purchase for conversion attribution
topsortClient.reportEvent({
  purchases: [{
    id: crypto.randomUUID(),
    occurredAt: new Date().toISOString(),
    items: [{ productId: 'prod-123', quantity: 1, unitPrice: 29.99 }],
    resolvedBidId: winner.resolvedBidId  // Optional for attribution
  }]
});`;
    }
  }

  return `// API call to ${log.endpoint}
fetch('https://api.topsort.com/v2${log.endpoint}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(${JSON.stringify(data, null, 2)})
});`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button size="sm" variant="ghost" className="h-6 px-2" onClick={handleCopy}>
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

function LogDetail({ log }: { log: ApiLog }) {
  const [activeTab, setActiveTab] = useState<string>('payload');
  const codeSnippet = getCodeSnippet(log);
  const jsonString = JSON.stringify(log.data, null, 2);

  return (
    <div className="border rounded-lg overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="bg-muted/50 px-3 py-2 border-b flex items-center justify-between">
          <TabsList className="h-8">
            <TabsTrigger value="payload" className="text-xs h-7 px-2 gap-1">
              <FileJson className="h-3 w-3" />
              Payload
            </TabsTrigger>
            {log.type === 'request' && (
              <TabsTrigger value="code" className="text-xs h-7 px-2 gap-1">
                <Code2 className="h-3 w-3" />
                Code
              </TabsTrigger>
            )}
          </TabsList>
          <CopyButton text={activeTab === 'code' ? codeSnippet : jsonString} />
        </div>

        <TabsContent value="payload" className="m-0">
          <pre className="text-xs bg-zinc-950 text-zinc-100 p-3 overflow-x-auto max-h-[200px]">
            <code>{jsonString}</code>
          </pre>
        </TabsContent>

        {log.type === 'request' && (
          <TabsContent value="code" className="m-0">
            <pre className="text-xs bg-zinc-950 text-zinc-100 p-3 overflow-x-auto max-h-[200px]">
              <code className="text-green-400">{codeSnippet}</code>
            </pre>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function LogEntry({ log }: { log: ApiLog }) {
  const [expanded, setExpanded] = useState(false);

  const getEventTypes = (): string[] => {
    if (log.endpoint === '/events' && log.type === 'request') {
      const data = log.data as { events?: Array<{ type: string }> };
      return [...new Set(data.events?.map(e => e.type) || [])];
    }
    return [];
  };

  const eventTypes = getEventTypes();

  return (
    <div className={cn(
      "border rounded-lg transition-all",
      log.type === 'error' && "border-destructive/50 bg-destructive/5",
      log.type === 'request' && "border-blue-200",
      log.type === 'response' && "border-green-200"
    )}>
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors",
          expanded && "border-b"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {log.type === 'request' && <ArrowRight className="h-4 w-4 text-blue-500" />}
          {log.type === 'response' && <ArrowLeft className="h-4 w-4 text-green-500" />}
          {log.type === 'error' && <XCircle className="h-4 w-4 text-destructive" />}

          <Badge
            variant={
              log.type === 'error' ? 'destructive' :
              log.type === 'request' ? 'default' : 'secondary'
            }
            className="text-xs"
          >
            {log.type.toUpperCase()}
          </Badge>

          <code className="text-sm font-medium">{log.endpoint}</code>

          {/* Event type badges */}
          {eventTypes.map(type => (
            <Badge key={type} variant="outline" className="text-xs capitalize">
              {type}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {log.duration && (
            <span className={cn(
              "flex items-center gap-1 font-mono",
              log.duration > 200 ? "text-yellow-600" : "text-green-600"
            )}>
              <Clock className="h-3 w-3" />
              {log.duration}ms
            </span>
          )}
          <span className="font-mono">{formatTime(log.timestamp)}</span>
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="p-3">
          <LogDetail log={log} />
        </div>
      )}
    </div>
  );
}

interface RequestInspectorProps {
  logs: ApiLog[];
  onClear: () => void;
}

export function RequestInspector({ logs, onClear }: RequestInspectorProps) {
  const [filter, setFilter] = useState<'all' | 'request' | 'response' | 'error'>('all');

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter(l => l.type === filter);

  const requestCount = logs.filter(l => l.type === 'request').length;
  const responseCount = logs.filter(l => l.type === 'response').length;
  const errorCount = logs.filter(l => l.type === 'error').length;

  const avgLatency = logs
    .filter(l => l.duration)
    .reduce((sum, l, _, arr) => sum + (l.duration || 0) / arr.length, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              API Request Inspector
            </CardTitle>
            <CardDescription>
              Real-time log of all API requests with code snippets
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {avgLatency > 0 && (
              <Badge variant="outline" className="font-mono text-xs">
                Avg: {Math.round(avgLatency)}ms
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear
            </Button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mt-3">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className="h-7 text-xs"
          >
            All ({logs.length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'request' ? 'default' : 'outline'}
            onClick={() => setFilter('request')}
            className="h-7 text-xs"
          >
            Requests ({requestCount})
          </Button>
          <Button
            size="sm"
            variant={filter === 'response' ? 'default' : 'outline'}
            onClick={() => setFilter('response')}
            className="h-7 text-xs"
          >
            Responses ({responseCount})
          </Button>
          {errorCount > 0 && (
            <Button
              size="sm"
              variant={filter === 'error' ? 'destructive' : 'outline'}
              onClick={() => setFilter('error')}
              className="h-7 text-xs"
            >
              Errors ({errorCount})
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No API activity yet</p>
              <p className="text-sm">Interact with the catalog to see API calls</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map(log => (
                <LogEntry key={log.id} log={log} />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
