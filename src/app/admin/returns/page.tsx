import { getReturnRequests } from "@/lib/actions/returns-actions";
import { ReturnsList } from "./returns-list";

export const metadata = {
    title: "Returns Management",
    description: "Manage customer return requests (RMA).",
};

export default async function ReturnsPage() {
    const { returns } = await getReturnRequests();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Returns (RMA)</h1>
                <p className="text-muted-foreground">Manage return requests and refunds.</p>
            </div>
            <ReturnsList initialReturns={returns} />
        </div>
    );
}
