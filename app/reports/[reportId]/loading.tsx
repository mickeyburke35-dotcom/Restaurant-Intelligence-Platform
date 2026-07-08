import { RouteLoadingState } from "@/components/route-loading-state";

export default function ReportDetailLoading() {
  return (
    <RouteLoadingState
      detail="Loading the approved insight snapshot, report details, and linked source evidence."
      eyebrow="Reports"
      metricCount={3}
      sidebar
      title="Report Detail"
    />
  );
}
