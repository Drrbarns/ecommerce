import { getCategories } from "@/lib/actions/category-actions";
import { getBrands } from "@/lib/actions/brand-actions";
import { ProductNewForm } from "@/components/admin/product-new-form";

export default async function NewProductPage() {
    const [categoriesResult, brandsResult] = await Promise.all([
        getCategories(),
        getBrands()
    ]);

    return (
        <ProductNewForm
            categories={categoriesResult.categories}
            brands={brandsResult.brands}
        />
    );
}
