/**
 * Product Catalog Page
 * Displays products with sponsored placements integrated via Topsort
 * Includes IAB viewability tracking, add-to-cart, and personalization
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCw,
  Star,
  Sparkles,
  Filter,
  Search,
  ShoppingCart,
  AlertCircle,
  Check,
  Eye,
  Target,
} from 'lucide-react';
import { useTopsortContext } from '@/context/TopsortContext';
import { useCart } from '@/context/CartContext';
import { mockProducts, getProductById } from '@/mock/products';
import type { CatalogProduct, SponsoredProduct } from '@/types/topsort';
import { cn } from '@/lib/utils';

const categories = ['all', 'electronics', 'home', 'lifestyle', 'fitness', 'food', 'furniture', 'accessories'];

// IAB viewability threshold: 50% visible for 1 second
const VIEWABILITY_THRESHOLD_PERCENT = 50;
const VIEWABILITY_THRESHOLD_MS = 1000;

function isSponsored(product: CatalogProduct): product is SponsoredProduct {
  return 'isSponsored' in product && product.isSponsored === true;
}

function ProductCard({
  product,
  onView,
  onTrackImpression,
  onTrackViewability,
  onAddToCart,
  size = 'normal',
}: {
  product: CatalogProduct;
  onView: (product: CatalogProduct) => void;
  onTrackImpression: (product: SponsoredProduct) => void;
  onTrackViewability: (product: SponsoredProduct, viewable: boolean, percentVisible: number, timeInViewMs: number) => void;
  onAddToCart: (product: CatalogProduct) => void;
  size?: 'normal' | 'large';
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const impressionTracked = useRef(false);
  const viewabilityTracked = useRef(false);
  const viewStartTime = useRef<number | null>(null);
  const timeInView = useRef(0);
  const [isViewable, setIsViewable] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const sponsored = isSponsored(product);

  // Track impression and viewability
  useEffect(() => {
    if (!sponsored) return;

    let viewabilityTimer: ReturnType<typeof setInterval>;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const percentVisible = Math.round(entry.intersectionRatio * 100);

        if (entry.isIntersecting && percentVisible >= VIEWABILITY_THRESHOLD_PERCENT) {
          if (!viewStartTime.current) {
            viewStartTime.current = Date.now();
          }

          if (!impressionTracked.current) {
            onTrackImpression(product);
            impressionTracked.current = true;
          }

          viewabilityTimer = setInterval(() => {
            if (viewStartTime.current) {
              timeInView.current = Date.now() - viewStartTime.current;

              if (timeInView.current >= VIEWABILITY_THRESHOLD_MS && !viewabilityTracked.current) {
                setIsViewable(true);
                onTrackViewability(product, true, percentVisible, timeInView.current);
                viewabilityTracked.current = true;
                clearInterval(viewabilityTimer);
              }
            }
          }, 100);
        } else {
          if (viewStartTime.current && !viewabilityTracked.current) {
            const finalTimeInView = Date.now() - viewStartTime.current;
            if (finalTimeInView > 200) {
              onTrackViewability(product, false, percentVisible, finalTimeInView);
            }
          }
          viewStartTime.current = null;
          clearInterval(viewabilityTimer);
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1.0] }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
      clearInterval(viewabilityTimer);
    };
  }, [product, sponsored, onTrackImpression, onTrackViewability]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAddedToCart(true);
    onAddToCart(product);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <Card
      ref={cardRef}
      className={cn(
        "group relative cursor-pointer overflow-hidden transition-all hover:shadow-lg",
        sponsored && "ring-2 ring-primary/30 hover:ring-primary/50 bg-primary/5",
        size === 'large' && "min-w-[280px]"
      )}
      onClick={() => onView(product)}
    >
      {/* Badges */}
      {sponsored && (
        <div className="absolute top-3 left-3 z-10 flex gap-1 flex-wrap">
          <Badge className="bg-primary/90 hover:bg-primary gap-1">
            <Sparkles className="h-3 w-3" />
            Sponsored
          </Badge>
          {isViewable && (
            <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700">
              <Eye className="h-3 w-3" />
              Viewable
            </Badge>
          )}
        </div>
      )}

      {/* Product image */}
      <div className={cn(
        "overflow-hidden bg-muted",
        size === 'large' ? "aspect-[4/3]" : "aspect-square"
      )}>
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Category & Vendor */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="capitalize">{product.category}</span>
          <span>{product.vendor}</span>
        </div>

        {/* Title */}
        <h3 className={cn(
          "font-semibold leading-tight group-hover:text-primary transition-colors",
          size === 'large' ? "text-lg" : "line-clamp-2"
        )}>
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount.toLocaleString()})
          </span>
        </div>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between pt-2">
          <span className={cn("font-bold", size === 'large' ? "text-xl" : "text-lg")}>
            ${product.price.toFixed(2)}
          </span>
          <Button
            size="sm"
            variant={addedToCart ? "default" : "secondary"}
            className={cn("gap-1 transition-all", addedToCart && "bg-green-600 hover:bg-green-600")}
            onClick={handleAddToCart}
          >
            {addedToCart ? (
              <>
                <Check className="h-3 w-3" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart className="h-3 w-3" />
                Add
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


export function CatalogPage() {
  const navigate = useNavigate();
  const {
    runAuction,
    trackImpression,
    trackViewability,
    trackClick,
    trackAddToCart,
    isInitialized,
    initialize,
    analytics,
  } = useTopsortContext();

  const { addItem } = useCart();

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Check if personalization is active (user has made purchases)
  const isPersonalized = analytics.purchases > 0;
  const sponsoredCount = products.filter(isSponsored).length;

  // Auto-initialize if not done via onboarding
  useEffect(() => {
    if (!isInitialized) {
      initialize('demo_api_key_xxxxx');
    }
  }, [isInitialized, initialize]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const auctionResponse = await runAuction({
        auctions: [{
          type: 'listings',
          slots: 3,
        }],
      });

      const winners = auctionResponse.results[0]?.winners || [];
      const sponsored: SponsoredProduct[] = winners
        .map(winner => {
          const product = getProductById(winner.id);
          if (!product) return null;
          return {
            ...product,
            isSponsored: true as const,
            resolvedBidId: winner.resolvedBidId,
            rank: winner.rank,
          };
        })
        .filter((p): p is SponsoredProduct => p !== null);

      const regular = mockProducts.filter(
        p => !winners.some(w => w.id === p.id)
      );

      // Combine: sponsored products first, then regular products
      setProducts([...sponsored, ...regular]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  }, [runAuction]);

  useEffect(() => {
    if (isInitialized) {
      fetchProducts();
    }
  }, [isInitialized, fetchProducts]);

  const handleTrackImpression = useCallback((product: SponsoredProduct) => {
    trackImpression(product.resolvedBidId, 'catalog', 'product-grid');
  }, [trackImpression]);

  const handleTrackViewability = useCallback((
    product: SponsoredProduct,
    viewable: boolean,
    percentVisible: number,
    timeInViewMs: number
  ) => {
    trackViewability(product.resolvedBidId, viewable, percentVisible, timeInViewMs);
  }, [trackViewability]);

  const handleAddToCart = useCallback((product: CatalogProduct) => {
    // Add to cart
    const resolvedBidId = isSponsored(product) ? product.resolvedBidId : undefined;
    addItem(product, 1, resolvedBidId);

    // Track add-to-cart as a click event (per Topsort docs)
    if (isSponsored(product)) {
      trackAddToCart(product.id, 1, product.price, product.resolvedBidId);
    } else {
      trackAddToCart(product.id, 1, product.price);
    }
  }, [addItem, trackAddToCart]);

  const handleViewProduct = (product: CatalogProduct) => {
    if (isSponsored(product)) {
      trackClick(product.resolvedBidId);
    }
    navigate(`/product/${product.id}`, { state: { product } });
  };

  // Filter products (keep sponsored at top when filtering)
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Product Catalog</h1>
          <p className="text-muted-foreground">
            Browse products with Topsort-powered sponsored placements
          </p>
        </div>
        <Button onClick={fetchProducts} variant="outline" disabled={loading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Refresh Auction
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={fetchProducts}>
            Retry
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize shrink-0"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{filteredProducts.length} products</span>
        {sponsoredCount > 0 && (
          <>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              {sponsoredCount} sponsored
            </span>
          </>
        )}
        {isPersonalized && (
          <>
            <span>•</span>
            <span className="flex items-center gap-1 text-primary">
              <Target className="h-3 w-3" />
              Personalized
            </span>
          </>
        )}
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                <div className="h-5 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                <div className="h-6 bg-muted rounded animate-pulse w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onView={handleViewProduct}
              onTrackImpression={handleTrackImpression}
              onTrackViewability={handleTrackViewability}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products match your filters</p>
          <Button
            variant="link"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
