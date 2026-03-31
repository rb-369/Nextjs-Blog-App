import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton";

export default function Loading() {
    return <PageLoadingSkeleton title="Loading Followed Feed" subtitle="Getting latest posts from authors you follow" cards={6} />;
}
