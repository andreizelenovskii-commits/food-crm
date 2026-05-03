import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import {
  PRODUCT_CATEGORIES,
  type ProductCategory,
  type ProductItem,
} from "@/modules/inventory/inventory.types";

export function InventoryProductSearchDialog({
  title,
  description,
  searchLabel,
  categoryTone,
  products,
  groupedProducts,
  selectedProductIds,
  selectedCategory,
  query,
  onClose,
  onQueryChange,
  onCategoryChange,
  onAddProduct,
  productNote,
}: {
  title: string;
  description: string;
  searchLabel: string;
  categoryTone: "red" | "rose";
  products: ProductItem[];
  groupedProducts: Array<[string, ProductItem[]]>;
  selectedProductIds: number[];
  selectedCategory: ProductCategory | "";
  query: string;
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: ProductCategory | "") => void;
  onAddProduct: (productId: number) => void;
  productNote?: (product: ProductItem) => string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-zinc-950/50 px-4 py-8 backdrop-blur-sm" onClick={onClose} role="presentation">
      <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[calc(100vh-4rem)] w-full max-w-3xl overflow-y-auto rounded-[14px] border border-zinc-200 bg-[#fffdfc] p-4 sm:p-5 shadow-2xl shadow-zinc-950/20" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Поиск товара</p>
            <h3 className="text-[1.5rem] font-semibold tracking-[-0.02em] text-zinc-950">{title}</h3>
            <p className="text-sm leading-6 text-zinc-600">{description}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950">
            Закрыть
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-700">{searchLabel}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Например: сыр или PRD-00012"
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-950/5"
            />
          </label>
          <CategoryFilter products={products} selectedCategory={selectedCategory} tone={categoryTone} onCategoryChange={onCategoryChange} />
        </div>

        <div className="mt-4 space-y-5">
          {groupedProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-5 text-sm text-zinc-500">
              По текущему фильтру товары не найдены.
            </div>
          ) : (
            groupedProducts.map(([categoryName, categoryProducts]) => (
              <ProductGroup
                key={categoryName}
                categoryName={categoryName}
                products={categoryProducts}
                selectedProductIds={selectedProductIds}
                onAddProduct={onAddProduct}
                productNote={productNote}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryFilter({
  products,
  selectedCategory,
  tone,
  onCategoryChange,
}: {
  products: ProductItem[];
  selectedCategory: ProductCategory | "";
  tone: "red" | "rose";
  onCategoryChange: (value: ProductCategory | "") => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => onCategoryChange("")} className={`rounded-full px-4 py-2 text-sm font-medium transition ${!selectedCategory ? "bg-zinc-950 text-white" : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-950"}`}>
        Все категории
      </button>
      {PRODUCT_CATEGORIES.map((category) => {
        const count = products.filter((product) => product.category === category).length;

        if (count === 0) {
          return null;
        }

        const inactiveClass =
          tone === "rose"
            ? "border border-rose-100 bg-rose-50 text-rose-800 hover:border-rose-200 hover:bg-rose-100"
            : "border border-red-100 bg-red-50 text-red-800 hover:border-red-200 hover:bg-red-100";

        return (
          <button key={category} type="button" onClick={() => onCategoryChange(category)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedCategory === category ? `${tone === "rose" ? "bg-rose-600" : "bg-red-800"} text-white` : inactiveClass}`}>
            {category} {count}
          </button>
        );
      })}
    </div>
  );
}

function ProductGroup({
  categoryName,
  products,
  selectedProductIds,
  onAddProduct,
  productNote,
}: {
  categoryName: string;
  products: ProductItem[];
  selectedProductIds: number[];
  onAddProduct: (productId: number) => void;
  productNote?: (product: ProductItem) => string;
}) {
  return (
    <section className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-zinc-950">{categoryName}</p>
        <p className="text-xs text-zinc-500">{products.length} позиций</p>
      </div>
      <div className="space-y-3">
        {products.map((product) => {
          const isAdded = selectedProductIds.includes(product.id);

          return (
            <div key={product.id} className="flex items-center justify-between gap-3 rounded-[22px] border border-zinc-200 bg-white px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-950">{product.name}</p>
                <p className="mt-1 truncate text-sm text-zinc-500">
                  {formatInventoryQuantity(product.stockQuantity)} {product.unit}
                  {product.sku ? ` • ${product.sku}` : ""}
                </p>
                {productNote ? <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-amber-700">{productNote(product)}</p> : null}
              </div>
              <button type="button" onClick={() => onAddProduct(product.id)} disabled={isAdded} className="shrink-0 rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400">
                {isAdded ? "Добавлено" : "Добавить"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
