import { getCategoryById } from "@/lib/actions/category-actions";
import { notFound } from "next/navigation";
import { CategoryEditForm } from "./edit-form";

export default async function CategoryEditPage({
    params,
}: {
    params: { id: string };
}) {
    const category = await getCategoryById(params.id);

    if (!category) {
        notFound();
    }

    return <CategoryEditForm category={category} />;
}
