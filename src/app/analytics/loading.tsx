import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton";

export default function Loading() {
    return <PageLoadingSkeleton title="Loading Analytics" subtitle="Crunching your creator metrics" cards={8} />;
}
