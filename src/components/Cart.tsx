/**
 * Shopping Cart Component
 * Slide-out cart drawer with checkout functionality
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  CreditCard,
  PartyPopper,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTopsortContext } from '@/context/TopsortContext';

export function Cart() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const { trackPurchase } = useTopsortContext();
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutState, setCheckoutState] = useState<'idle' | 'processing' | 'success'>('idle');

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setCheckoutState('processing');

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Track purchase for each item
    for (const item of items) {
      trackPurchase(
        item.product.id,
        item.quantity,
        item.product.price,
        item.resolvedBidId // Will be undefined for non-sponsored products
      );
    }

    setCheckoutState('success');

    // Clear cart and close after showing success
    setTimeout(() => {
      clearCart();
      setCheckoutState('idle');
      setIsOpen(false);
    }, 2000);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {totalItems > 0 && (
            <Badge
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
          </SheetTitle>
          <SheetDescription>
            {totalItems === 0
              ? 'Your cart is empty'
              : `${totalItems} item${totalItems > 1 ? 's' : ''} in your cart`}
          </SheetDescription>
        </SheetHeader>

        {checkoutState === 'success' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600">
              <PartyPopper className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Order Confirmed!</h3>
              <p className="text-muted-foreground">
                Thank you for your purchase.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No items in your cart</p>
                  <p className="text-sm">Browse the catalog to add products</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.product.id} className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                      {item.resolvedBidId && (
                        <div className="absolute top-1 left-1">
                          <Sparkles className="h-3 w-3 text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-sm leading-tight line-clamp-2">
                            {item.product.name}
                          </h4>
                          {item.resolvedBidId && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              Sponsored
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Price */}
                        <span className="font-semibold">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <SheetFooter className="flex-col gap-4 sm:flex-col">
                <Separator />

                {/* Totals */}
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={checkoutState === 'processing'}
                >
                  {checkoutState === 'processing' ? (
                    <>
                      <CreditCard className="h-4 w-4 mr-2 animate-pulse" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Checkout (${totalPrice.toFixed(2)})
                    </>
                  )}
                </Button>

                {/* Attribution note */}
                {items.some(item => item.resolvedBidId) && (
                  <p className="text-xs text-muted-foreground text-center">
                    <Sparkles className="h-3 w-3 inline mr-1" />
                    Sponsored items will be tracked for attribution
                  </p>
                )}
              </SheetFooter>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
