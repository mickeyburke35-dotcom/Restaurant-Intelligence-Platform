import { RouteLoadingState } from "@/components/route-loading-state";

export default function ReportsLoading() {
  return (
    <RouteLoadingState
      detail="Loading approved insight reports, creation controls, and stored snapshot metrics."
      eyebrow="Reports"
      metricCount={3}
      title="Approved Insight Reports"
    />
  );
}
