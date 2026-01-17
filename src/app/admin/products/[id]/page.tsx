import { notFound } from "next/navigation";
import { getProductById } from "@/lib/actions/product-actions";
import { EditProductForm } from "./edit-form";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        notFound();
    }

    return <EditProductForm product={product as any} />;
}
