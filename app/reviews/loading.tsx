import { RouteLoadingState } from "@/components/route-loading-state";

export default function ReviewsLoading() {
  return (
    <RouteLoadingState
      detail="Loading tenant-scoped review filters, result counts, and the selected review detail."
      eyebrow="Reviews"
      metricCount={4}
      title="Review Dashboard"
    />
  );
}
