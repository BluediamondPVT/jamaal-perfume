"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface WishlistButtonProps {
  productId: string;
  isInWishlist?: boolean;
  onWishlistChange?: (inWishlist: boolean) => void;
}

export default function WishlistButton({
  productId,
  isInWishlist = false,
  onWishlistChange,
}: WishlistButtonProps) {
  const [inWishlist, setInWishlist] = useState(isInWishlist);
  const [loading, setLoading] = useState(false);

  const handleWishlistToggle = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          action: inWishlist ? "remove" : "add",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update wishlist");
      }

      const newState = !inWishlist;
      setInWishlist(newState);
      onWishlistChange?.(newState);
      toast.success(newState ? "Added to wishlist" : "Removed from wishlist");
    } catch (error) {
      toast.error("Failed to update wishlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleWishlistToggle}
      disabled={loading}
      variant="outline"
      size="icon"
      className={inWishlist ? "text-red-500 border-red-300" : ""}
    >
      <Heart
        className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`}
      />
    </Button>
  );
}
