import { useQuery } from "@tanstack/react-query";
import { productsApi } from "~/lib/api/products";
import type { ProductAttributes, ProductVariantAttributes } from "~/lib/api/types";
import type { Resource } from "~/lib/api/client";
import { usePageBuilder } from "./PageBuilderContext";

interface EmbeddedProductProps {
  productId: string;
}

export default function EmbeddedProduct({ productId }: EmbeddedProductProps) {
  const { theme } = usePageBuilder();
  const palette = theme.colorPalette;

  const { data: productResource, isLoading: productLoading, error } = useQuery({
    queryKey: ['embedded-product', productId],
    queryFn: () => productsApi.getProductById(productId),
    select: (data) => data.data,
    enabled: !!productId,
    retry: 1,
  });

  const { data: variantsData, isLoading: variantsLoading } = useQuery({
    queryKey: ['embedded-product-variants', productId],
    queryFn: () => productsApi.getVariants(productId),
    select: (data) => data.data,
    enabled: !!productId,
  });

  const loading = productLoading || variantsLoading;
  const product = productResource?.attributes;
  const variants = variantsData || [];

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '2rem', height: '2rem', border: '2px solid #e5e7eb', borderTopColor: palette?.color1 || '#7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#9ca3af' }}>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
        <p style={{ color: '#ef4444' }}>Product not found.</p>
        <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Try re-selecting the product in the editor.</p>
      </div>
    );
  }

  const primaryColor = palette?.color1 || '#7c3aed';
  const textColor = palette?.color4 || '#1f2937';
  const mutedColor = palette?.color2 || '#9ca3af';

  return (
    <div style={{
      borderRadius: '0.5rem',
      overflow: 'hidden',
      border: `1px solid ${palette?.color2 || '#e5e7eb'}`,
      backgroundColor: palette?.color5 || '#ffffff',
    }}>
      {/* Product image */}
      {product.image_url ? (
        <div style={{ width: '100%', height: '240px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
          <img
            src={product.image_url}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      ) : (
        <div style={{
          width: '100%', height: '160px', backgroundColor: `${primaryColor}08`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg style={{ width: '3rem', height: '3rem', color: mutedColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
        </div>
      )}

      {/* Product details */}
      <div style={{ padding: '1.25rem' }}>
        {/* Name */}
        <h3 style={{
          margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 600, color: textColor,
        }}>
          {product.name}
        </h3>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: primaryColor }}>
            {formatPrice(product.price_cents, product.currency)}
          </span>
          {product.pricing_type !== 'fixed' && (
            <span style={{ fontSize: '0.75rem', color: mutedColor }}>
              {product.pricing_type === 'variable' ? 'Pay what you want' : 'Tiered pricing'}
            </span>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6 }}>
            {product.description}
          </p>
        )}

        {/* Availability badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500,
            backgroundColor: product.available ? '#dcfce7' : '#fee2e2',
            color: product.available ? '#166534' : '#991b1b',
          }}>
            <span style={{
              width: '0.375rem', height: '0.375rem', borderRadius: '50%',
              backgroundColor: product.available ? '#22c55e' : '#ef4444',
            }} />
            {product.available ? 'In Stock' : 'Out of Stock'}
          </span>
          {product.inventory_count != null && (
            <span style={{ fontSize: '0.75rem', color: mutedColor }}>
              {product.inventory_count} available
            </span>
          )}
          {product.sku && (
            <span style={{ fontSize: '0.75rem', color: mutedColor }}>
              SKU: {product.sku}
            </span>
          )}
        </div>

        {/* Tiered pricing table */}
        {product.pricing_type === 'tiered' && product.pricing_config?.tiers && (
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: textColor, marginBottom: '0.375rem' }}>Pricing Tiers</p>
            <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${palette?.color2 || '#e5e7eb'}` }}>
                  <th style={{ textAlign: 'left', padding: '0.375rem 0.5rem', color: mutedColor, fontWeight: 500 }}>Quantity</th>
                  <th style={{ textAlign: 'right', padding: '0.375rem 0.5rem', color: mutedColor, fontWeight: 500 }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {product.pricing_config.tiers.map((tier: any, i: number) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${palette?.color2 || '#e5e7eb'}20` }}>
                    <td style={{ padding: '0.375rem 0.5rem', color: textColor }}>
                      {tier.min_quantity}{tier.max_quantity ? `–${tier.max_quantity}` : '+'}
                    </td>
                    <td style={{ textAlign: 'right', padding: '0.375rem 0.5rem', color: textColor, fontWeight: 500 }}>
                      {formatPrice(tier.price_cents, product.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Variable pricing range */}
        {product.pricing_type === 'variable' && product.pricing_config && (
          <div style={{ marginBottom: '1rem', fontSize: '0.8125rem', color: '#6b7280' }}>
            {product.pricing_config.min_cents != null && (
              <span>Min: {formatPrice(product.pricing_config.min_cents, product.currency)}</span>
            )}
            {product.pricing_config.min_cents != null && product.pricing_config.max_cents != null && ' — '}
            {product.pricing_config.max_cents != null && (
              <span>Max: {formatPrice(product.pricing_config.max_cents, product.currency)}</span>
            )}
          </div>
        )}

        {/* Variants */}
        {variants.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: textColor, marginBottom: '0.375rem' }}>
              Options ({variants.length})
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {variants.map((variant) => (
                <VariantChip key={variant.id} variant={variant} currency={product.currency} palette={palette} />
              ))}
            </div>
          </div>
        )}

        {/* CTA button */}
        <button
          disabled
          style={{
            width: '100%', padding: '0.75rem 1.5rem',
            backgroundColor: product.available ? primaryColor : '#d1d5db',
            color: product.available ? '#ffffff' : '#6b7280',
            border: 'none', borderRadius: '0.375rem',
            fontSize: '0.875rem', fontWeight: 600,
            cursor: 'default', opacity: 0.9,
          }}
        >
          {product.available ? 'Add to Cart' : 'Currently Unavailable'}
        </button>
      </div>
    </div>
  );
}

function VariantChip({ variant, currency, palette }: {
  variant: Resource<ProductVariantAttributes>;
  currency: string;
  palette: any;
}) {
  const attrs = variant.attributes;
  const hasPrice = attrs.price_cents != null;

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
      padding: '0.375rem 0.75rem', borderRadius: '0.375rem',
      border: `1px solid ${palette?.color2 || '#e5e7eb'}`,
      backgroundColor: attrs.available ? (palette?.color5 || '#ffffff') : '#f9fafb',
      fontSize: '0.75rem', color: attrs.available ? (palette?.color4 || '#374151') : '#9ca3af',
    }}>
      <span style={{ fontWeight: 500 }}>{attrs.name}</span>
      {hasPrice && (
        <span style={{ color: palette?.color1 || '#7c3aed', fontWeight: 600 }}>
          {formatPrice(attrs.price_cents, currency)}
        </span>
      )}
      {!attrs.available && (
        <span style={{ fontSize: '0.625rem', color: '#ef4444' }}>Sold out</span>
      )}
    </div>
  );
}

function formatPrice(cents: number | null, currency: string): string {
  if (cents == null) return 'No price';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}
