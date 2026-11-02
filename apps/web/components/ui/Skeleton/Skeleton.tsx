import styles from './Skeleton.module.css';
import { cn } from '@/lib/utils/cn';

export interface SkeletonProps {
  /** Width (CSS value). Defaults to 100% */
  width?: string | undefined;
  /** Height (CSS value). Defaults to 1em */
  height?: string | undefined;
  /** Border radius. Defaults to --radius-md */
  rounded?: 'sm' | 'md' | 'lg' | 'full' | undefined;
  className?: string | undefined;
}

/**
 * Content placeholder shown during data loading.
 * Use instead of spinners for layout-heavy content areas.
 * aria-busy is set on the container, not individual skeletons.
 */
export function Skeleton({ width, height, rounded = 'md', className }: SkeletonProps) {
  return (
    <span
      className={cn(styles.skeleton, styles[`rounded-${rounded}`], className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

// ── Preset Composite Skeletons ────────────────────────────────────────────────

/** Skeleton layout matching ProductCard dimensions */
export function ProductCardSkeleton() {
  return (
    <div className={styles.productCard} aria-hidden="true">
      <Skeleton className={styles.productImage} />
      <div className={styles.productBody}>
        <Skeleton height="0.875rem" width="60%" />
        <Skeleton height="1.25rem" width="85%" />
        <Skeleton height="0.875rem" width="40%" />
      </div>
    </div>
  );
}
