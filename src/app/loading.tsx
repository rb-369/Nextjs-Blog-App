import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton";

export default function Loading() {
    return <PageLoadingSkeleton title="Preparing VELO" subtitle="Loading your personalized feed" cards={6} />;
}
