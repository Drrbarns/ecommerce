import { getCategories } from "@/lib/actions/category-actions";
import { ProductNewForm } from "@/components/admin/product-new-form";

export default async function NewProductPage() {
    const { categories } = await getCategories();

    return <ProductNewForm categories={categories} />;
}
