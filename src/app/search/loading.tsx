import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton";

export default function Loading() {
    return <PageLoadingSkeleton title="Searching Posts" subtitle="Finding the best matches" cards={6} />;
}
