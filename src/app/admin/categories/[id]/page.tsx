import { getCategoryById } from "@/lib/actions/category-actions";
import { notFound } from "next/navigation";
import { CategoryEditForm } from "./edit-form";

export default async function CategoryEditPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const category = await getCategoryById(id);

    if (!category) {
        notFound();
    }

    return <CategoryEditForm category={category} />;
}
