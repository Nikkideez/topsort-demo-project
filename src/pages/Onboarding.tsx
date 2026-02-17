/**
 * Onboarding Page
 * Interactive walkthrough showing how Topsort integration works
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  ArrowRight,
  Code2,
  Zap,
  BarChart3,
  ShoppingCart,
  MousePointer,
  Eye,
  DollarSign,
  Copy,
  Check,
  Server,
  Monitor,
  Info,
  ExternalLink,
} from 'lucide-react';
import { useTopsortContext } from '@/context/TopsortContext';
import { cn } from '@/lib/utils';

const steps = [
  {
    id: 1,
    title: 'Initialize the Client',
    description: 'Set up the Topsort API client with your credentials',
    icon: Code2,
    content: InitializeStep,
    docsLinks: [
      { url: 'https://docs.topsort.com/ad-platform/sdks/javascript-sdk/', label: 'JavaScript SDK' },
    ],
  },
  {
    id: 2,
    title: 'Run Auctions',
    description: 'Request sponsored product placements for your pages',
    icon: Zap,
    content: AuctionStep,
    docsLinks: [
      { url: 'https://docs.topsort.com/auctions/', label: 'Auctions API' },
      { url: 'https://docs.topsort.com/en/api-reference/examples/sponsored-listings/search', label: 'Sponsored Listings' },
    ],
  },
  {
    id: 3,
    title: 'Track Events',
    description: 'Send impressions, clicks, and purchases for attribution',
    icon: BarChart3,
    content: EventsStep,
    docsLinks: [
      { url: 'https://docs.topsort.com/en/ad-server/events/events-api', label: 'Events API' },
      { url: 'https://docs.topsort.com/ad-platform/listings/analytics-js/', label: 'Analytics.js' },
    ],
  },
  {
    id: 4,
    title: 'Go Live!',
    description: 'Explore the demo and see the integration in action',
    icon: CheckCircle2,
    content: GoLiveStep,
    docsLinks: [
      { url: 'https://docs.topsort.com/', label: 'Full Documentation' },
    ],
  },
];

function CodeBlock({ code, language = 'typescript' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-zinc-950 text-zinc-100 p-4 rounded-lg text-sm overflow-x-auto">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}

function InitializeStep({ onNext }: { onNext: () => void }) {
  const { initialize, isInitialized } = useTopsortContext();
  const [apiKey] = useState('demo_api_key_xxxxx');

  const handleInitialize = () => {
    initialize(apiKey);
    onNext();
  };

  const code = `// Option 1: Via script tag
<script async type="module"
  src="https://unpkg.com/@topsort/sdk@latest/dist/index.mjs">
</script>
<script>
  window.TS = { token: "${apiKey}" };
</script>

// Option 2: ES Module import
import { TopsortClient } from "https://unpkg.com/@topsort/sdk@latest/dist/index.mjs";

const topsortClient = new TopsortClient({
  apiKey: "${apiKey}"
});`;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Setting Up the Topsort Client</h3>
        <p className="text-muted-foreground">
          The first step is initializing the Topsort client with your API credentials.
          This client handles all communication with the Topsort API, including
          authentication, request signing, and error handling.
        </p>
      </div>

      <CodeBlock code={code} />

      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline">API Key</Badge>
          <code className="text-sm bg-background px-2 py-1 rounded">{apiKey}</code>
        </div>
        <p className="text-sm text-muted-foreground">
          In production, you would use your actual API key from the Topsort dashboard.
        </p>
      </div>

      {/* Production Architecture Note */}
      <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-blue-700 font-medium">
          <Info className="h-4 w-4" />
          Production Architecture
        </div>
        <div className="text-sm text-blue-900 space-y-2">
          <p>
            <strong>This demo runs entirely client-side for simplicity.</strong> In production, you'd use a different architecture:
          </p>
          <div className="grid gap-2 mt-3">
            <div className="flex items-start gap-2">
              <Server className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium">Auction API → Server-side</span>
                <p className="text-blue-700 text-xs">API key stays secure on your backend. Frontend calls your server, which calls Topsort.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Monitor className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium">Events API → Client-side OK</span>
                <p className="text-blue-700 text-xs">Topsort provides a public token for event tracking. Browser-direct ensures accurate impression/click data.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button onClick={handleInitialize} className="w-full" size="lg">
        {isInitialized ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Client Initialized — Continue
          </>
        ) : (
          <>
            Initialize Client
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

function AuctionStep({ onNext }: { onNext: () => void }) {
  const { runAuction, isInitialized } = useTopsortContext();
  const [auctionRun, setAuctionRun] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRunAuction = async () => {
    if (!isInitialized) return;
    setLoading(true);
    try {
      await runAuction({
        auctions: [{
          type: 'listings',
          slots: 3,
        }],
      });
      setAuctionRun(true);
      setTimeout(onNext, 1000);
    } finally {
      setLoading(false);
    }
  };

  const code = `// Method 1: Search query only (keyword-matched products)
const searchAuction = {
  auctions: [{
    type: 'listings',
    slots: 3,
    searchQuery: 'Running shoes'  // Only bids targeting this keyword
  }]
};

// Method 2: Products + Search query (expanded bidding pool)
const combinedAuction = {
  auctions: [{
    type: 'listings',
    slots: 3,
    products: {
      ids: ['p_ojng4', 'p_8VKDt', 'p_Mfk15']  // Specific products
    },
    searchQuery: 'Running shoes'  // Plus keyword matches
  }]
};

topsortClient.createAuction(searchAuction)
  .then(result => {
    result.results[0].winners.forEach(winner => {
      console.log(\`Product \${winner.id} won slot \${winner.rank}\`);
      console.log(\`Resolved Bid ID: \${winner.resolvedBidId}\`);
    });
  });`;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Running Auctions</h3>
        <p className="text-muted-foreground">
          The Auction API determines which products should be promoted in your catalog.
          Advertisers bid in real-time, and winning products are returned with tracking IDs.
        </p>
      </div>

      <CodeBlock code={code} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">Real-time</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Auctions complete in &lt;100ms
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="font-medium">Second-price</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Fair bidding mechanism
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <span className="font-medium">ML-powered</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Optimized for relevance
            </p>
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={handleRunAuction}
        className="w-full"
        size="lg"
        disabled={!isInitialized || loading}
      >
        {loading ? (
          <>Running Auction...</>
        ) : auctionRun ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Auction Complete — 3 Winners Selected
          </>
        ) : (
          <>
            Run Test Auction
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

function EventsStep({ onNext }: { onNext: () => void }) {
  const [eventsUnderstood, setEventsUnderstood] = useState(false);

  const code = `// Option 1: JavaScript SDK (impressions)
const impressions = winners.map(winner => ({
  resolvedBidId: winner.resolvedBidId,
  id: crypto.randomUUID(),
  occurredAt: new Date().toISOString(),
  opaqueUserId: getUserId(),
  placement: { path: '/search/winter' }
}));
topsortClient.reportEvent({ impressions });

// Option 2: REST API (impressions, clicks, purchases)
fetch('https://api.topsort.com/v2/events', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    impressions: [{ resolvedBidId: '...', occurredAt: '...' }],
    clicks: [{ resolvedBidId: '...', occurredAt: '...' }],
    purchases: [{ items: [{ productId: '...', quantity: 1 }] }]
  })
});

// Option 3: Analytics.js (HTML data attributes)
// <div data-ts-resolved-bid="...">  // Auto-tracks impression
// <a data-ts-clickable>              // Auto-tracks click`;

  const handleContinue = () => {
    setEventsUnderstood(true);
    setTimeout(onNext, 500);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Event Tracking</h3>
        <p className="text-muted-foreground">
          Track user interactions to measure campaign performance and enable proper attribution.
          The <code className="bg-muted px-1 rounded">resolvedBidId</code> links each event
          back to the winning auction bid.
        </p>
      </div>

      <CodeBlock code={code} />

      <div className="space-y-3">
        <h4 className="font-medium">Event Types</h4>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border">
            <Eye className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Impression</p>
              <p className="text-xs text-muted-foreground">When a sponsored product is displayed</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border">
            <MousePointer className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Click</p>
              <p className="text-xs text-muted-foreground">When user clicks product (including Add to Cart)</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border">
            <ShoppingCart className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Purchase</p>
              <p className="text-xs text-muted-foreground">When user completes a purchase</p>
            </div>
          </div>
        </div>
      </div>

      <Button onClick={handleContinue} className="w-full" size="lg">
        {eventsUnderstood ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Got it!
          </>
        ) : (
          <>
            I Understand Event Tracking
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

function GoLiveStep() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-semibold">You're Ready!</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          You now understand the core concepts of Topsort integration.
          Explore the demo to see it all working together.
        </p>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => navigate('/catalog')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Product Catalog
            </CardTitle>
            <CardDescription>
              See sponsored products integrated into a real catalog experience
            </CardDescription>
          </CardHeader>
        </Card>
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => navigate('/dashboard')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Integration Dashboard
            </CardTitle>
            <CardDescription>
              Monitor API calls, events, and integration health in real-time
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => navigate('/catalog')}
          className="flex-1"
          size="lg"
        >
          Explore Catalog
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button
          onClick={() => navigate('/dashboard')}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          View Dashboard
        </Button>
      </div>
    </div>
  );
}

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const StepContent = steps[currentStep].content;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Topsort Integration Guide</h1>
        <p className="text-muted-foreground">
          Learn how to integrate Topsort's Retail Media APIs into your platform
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Step {currentStep + 1} of {steps.length}</span>
          <span className="font-medium">{steps[currentStep].title}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => index <= currentStep && setCurrentStep(index)}
            className={cn(
              "flex flex-col items-center gap-2 transition-colors",
              index <= currentStep ? "text-primary" : "text-muted-foreground",
              index < currentStep && "cursor-pointer hover:text-primary/80"
            )}
            disabled={index > currentStep}
          >
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
              index < currentStep && "bg-primary border-primary text-primary-foreground",
              index === currentStep && "border-primary",
              index > currentStep && "border-muted"
            )}>
              {index < currentStep ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </div>
            <span className="text-xs font-medium hidden sm:block">{step.title}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const Icon = steps[currentStep].icon;
                  return <Icon className="h-5 w-5" />;
                })()}
                {steps[currentStep].title}
              </CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </div>
            {steps[currentStep].docsLinks && steps[currentStep].docsLinks.length > 0 && (
              <div className="flex items-center gap-3 shrink-0">
                {steps[currentStep].docsLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    {link.label}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <StepContent onNext={handleNext} />
        </CardContent>
      </Card>
    </div>
  );
}
