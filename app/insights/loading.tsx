import { RouteLoadingState } from "@/components/route-loading-state";

export default function InsightsLoading() {
  return (
    <RouteLoadingState
      detail="Loading the review queue, selected insight evidence, and human review status."
      eyebrow="AI insights"
      metricCount={4}
      title="AI Insight Review"
    />
  );
}
