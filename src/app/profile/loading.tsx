import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton";

export default function Loading() {
    return <PageLoadingSkeleton title="Loading Profile" subtitle="Fetching your account details" cards={2} />;
}
