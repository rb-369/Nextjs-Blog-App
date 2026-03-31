import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton";

export default function Loading() {
    return <PageLoadingSkeleton title="Loading Saved Posts" subtitle="Fetching your bookmarks" cards={6} />;
}
