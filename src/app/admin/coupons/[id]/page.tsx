import { notFound } from "next/navigation";
import { getCouponById } from "@/lib/actions/coupon-actions";
import { EditCouponForm } from "./edit-form";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditCouponPage({ params }: PageProps) {
    const { id } = await params;
    const coupon = await getCouponById(id);

    if (!coupon) {
        notFound();
    }

    return <EditCouponForm coupon={coupon} />;
}
