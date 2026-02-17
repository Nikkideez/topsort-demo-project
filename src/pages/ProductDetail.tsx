/**
 * Product Detail Page
 * Shows full product details with purchase simulation
 */

import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Star,
  Sparkles,
  ShoppingCart,
  Check,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  Package,
  CreditCard,
  PartyPopper,
} from 'lucide-react';
import { useTopsortContext } from '@/context/TopsortContext';
import { useCart } from '@/context/CartContext';
import { getProductById } from '@/mock/products';
import type { CatalogProduct, SponsoredProduct } from '@/types/topsort';
function isSponsored(product: CatalogProduct): product is SponsoredProduct {
  return 'isSponsored' in product && product.isSponsored === true;
}

type PurchaseStep = 'idle' | 'processing' | 'success';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { trackPurchase, trackAddToCart } = useTopsortContext();
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>('idle');
  const [addedToCart, setAddedToCart] = useState(false);

  // Get product from navigation state or fetch by ID
  const product: CatalogProduct | undefined =
    location.state?.product || (id ? getProductById(id) : undefined);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold mb-4">Product not found</h2>
        <Button onClick={() => navigate('/catalog')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Catalog
        </Button>
      </div>
    );
  }

  const sponsored = isSponsored(product);
  const total = product.price * quantity;

  const handlePurchase = async () => {
    setPurchaseStep('processing');

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Track ALL purchase events for attribution analysis
    // resolvedBidId is only included for sponsored products (attributed purchases)
    if (sponsored) {
      trackPurchase(product.id, quantity, product.price, product.resolvedBidId);
    } else {
      trackPurchase(product.id, quantity, product.price);
    }

    setPurchaseStep('success');
  };

  const handleAddToCart = () => {
    const resolvedBidId = sponsored ? product.resolvedBidId : undefined;
    addItem(product, quantity, resolvedBidId);

    // Track add-to-cart as click event (per Topsort docs)
    if (sponsored) {
      trackAddToCart(product.id, quantity, product.price, product.resolvedBidId);
    } else {
      trackAddToCart(product.id, quantity, product.price);
    }

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleContinueShopping = () => {
    setPurchaseStep('idle');
    navigate('/catalog');
  };

  // Purchase success state
  if (purchaseStep === 'success') {
    return (
      <div className="max-w-lg mx-auto py-12">
        <Card>
          <CardContent className="pt-6 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600">
              <PartyPopper className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Order Confirmed!</h2>
              <p className="text-muted-foreground">
                Thank you for your purchase. Your order is being processed.
              </p>
            </div>

            <Separator />

            <div className="flex items-center gap-4 text-left">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{product.name}</p>
                <p className="text-sm text-muted-foreground">Qty: {quantity}</p>
              </div>
              <p className="font-semibold">${total.toFixed(2)}</p>
            </div>

            <div className={`rounded-lg p-4 text-left space-y-2 ${sponsored ? 'bg-primary/10' : 'bg-muted'}`}>
              <div className={`flex items-center gap-2 font-medium ${sponsored ? 'text-primary' : 'text-foreground'}`}>
                <Sparkles className="h-4 w-4" />
                {sponsored ? 'Attributed Purchase' : 'Organic Purchase'}
              </div>
              <p className="text-sm text-muted-foreground">
                {sponsored ? (
                  <>
                    This purchase is <strong>attributed</strong> to the advertising campaign.
                    The <code className="bg-background px-1 rounded text-xs">purchase</code> event
                    includes the <code className="bg-background px-1 rounded text-xs">resolvedBidId</code> for
                    conversion tracking and ROAS calculation.
                  </>
                ) : (
                  <>
                    This is an <strong>organic purchase</strong> (non-sponsored product).
                    The <code className="bg-background px-1 rounded text-xs">purchase</code> event
                    is tracked for baseline metrics and incrementality analysis, but without attribution.
                  </>
                )}
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleContinueShopping} className="flex-1">
                Continue Shopping
              </Button>
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="flex-1">
                View Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate('/catalog')} className="-ml-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Catalog
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product image */}
        <div className="relative">
          {sponsored && (
            <div className="absolute top-4 left-4 z-10">
              <Badge className="bg-primary/90 hover:bg-primary gap-1 text-sm py-1">
                <Sparkles className="h-3 w-3" />
                Sponsored
              </Badge>
            </div>
          )}
          <div className="aspect-square rounded-xl overflow-hidden bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Product info */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="capitalize">{product.category}</span>
              <span>•</span>
              <span>{product.vendor}</span>
            </div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{product.rating}</span>
              </div>
              <span className="text-muted-foreground">
                ({product.reviewCount.toLocaleString()} reviews)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="text-4xl font-bold">${product.price.toFixed(2)}</div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Features */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>2 Year Warranty</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
              <span>30-Day Returns</span>
            </div>
          </div>

          <Separator />

          {/* Quantity & Purchase */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Quantity selector */}
              <div className="flex items-center justify-between">
                <span className="font-medium">Quantity</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between py-3 border-t">
                <span className="text-lg font-medium">Total</span>
                <span className="text-2xl font-bold">${total.toFixed(2)}</span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  size="lg"
                  variant={addedToCart ? "default" : "outline"}
                  className={`flex-1 h-14 ${addedToCart ? 'bg-green-600 hover:bg-green-600' : ''}`}
                  onClick={handleAddToCart}
                  disabled={purchaseStep === 'processing'}
                >
                  {addedToCart ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Added!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  className="flex-1 h-14"
                  onClick={handlePurchase}
                  disabled={purchaseStep === 'processing'}
                >
                  {purchaseStep === 'processing' ? (
                    <>
                      <CreditCard className="h-5 w-5 mr-2 animate-pulse" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Buy Now
                    </>
                  )}
                </Button>
              </div>

              {/* Info note for sponsored products */}
              {sponsored && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  <span>
                    This is a sponsored product. Purchasing will trigger a{' '}
                    <code className="bg-background px-1 rounded">purchase</code> event
                    for conversion tracking and attribution.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* In stock indicator */}
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Check className="h-4 w-4" />
            <span>In Stock - Ships within 24 hours</span>
          </div>
        </div>
      </div>

      {/* Tracking info card (for demo purposes) */}
      {sponsored && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5" />
              Integration Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Resolved Bid ID:</span>
                <code className="block bg-background px-2 py-1 rounded mt-1 text-xs break-all">
                  {product.resolvedBidId}
                </code>
              </div>
              <div>
                <span className="text-muted-foreground">Auction Rank:</span>
                <span className="block font-medium mt-1">#{product.rank}</span>
              </div>
            </div>
            <p className="text-muted-foreground">
              Events tracked: <Badge variant="secondary">click</Badge> (on navigation here)
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
