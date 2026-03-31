import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton";

export default function Loading() {
    return <PageLoadingSkeleton title="Opening Post" subtitle="Loading content and discussion" cards={3} />;
}
