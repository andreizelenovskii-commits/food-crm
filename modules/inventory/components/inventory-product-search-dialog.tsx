import { ModuleIcon } from "@/components/ui/module-icon";
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
    <div className="fixed inset-0 z-70 overflow-y-auto bg-zinc-950/30 px-4 py-6 backdrop-blur-sm sm:py-8" onClick={onClose} role="presentation">
      <div role="dialog" aria-modal="true" aria-label={title} className="relative mx-auto max-h-[calc(100vh-4rem)] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#fffdfc_0%,#fff3f2_48%,#f7eeee_100%)] p-4 shadow-[0_24px_80px_rgba(127,29,29,0.18)] sm:p-5" onClick={(event) => event.stopPropagation()}>
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-red-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/80 blur-3xl" />
        <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-red-800 text-white shadow-sm shadow-red-950/15">
              <ModuleIcon name="box" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800/70">Поиск товара</p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-950">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-full border border-red-100 bg-white/90 px-4 text-xs font-semibold text-red-800 shadow-sm shadow-red-950/5 transition hover:border-red-800 hover:bg-red-800 hover:text-white">
            Закрыть
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          <label className="space-y-2">
            <span className="text-[11px] font-semibold text-zinc-700">{searchLabel}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Например: сыр или PRD-00012"
              className="h-10 w-full rounded-full border border-red-950/10 bg-white/85 px-4 text-sm font-medium text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10"
            />
          </label>
          <CategoryFilter products={products} selectedCategory={selectedCategory} tone={categoryTone} onCategoryChange={onCategoryChange} />
        </div>

        <div className="mt-4 space-y-5">
          {groupedProducts.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-red-200 bg-white/55 px-4 py-5 text-sm text-zinc-500">
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
      <button type="button" onClick={() => onCategoryChange("")} className={`inline-flex h-9 items-center rounded-full border px-3.5 text-xs font-semibold shadow-sm shadow-red-950/5 transition ${!selectedCategory ? "border-red-800 bg-red-800 text-white" : "border-red-100 bg-white/85 text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white"}`}>
        Все категории
      </button>
      {PRODUCT_CATEGORIES.map((category) => {
        const count = products.filter((product) => product.category === category).length;

        if (count === 0) {
          return null;
        }

        const inactiveClass =
          tone === "rose"
            ? "border-rose-100 bg-rose-50 text-rose-800 hover:border-rose-200 hover:bg-rose-100"
            : "border-red-100 bg-white/85 text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white";

        return (
          <button key={category} type="button" onClick={() => onCategoryChange(category)} className={`inline-flex h-9 items-center rounded-full border px-3.5 text-xs font-semibold shadow-sm shadow-red-950/5 transition ${selectedCategory === category ? `${tone === "rose" ? "border-rose-600 bg-rose-600" : "border-red-800 bg-red-800"} text-white` : inactiveClass}`}>
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
    <section className="space-y-3 rounded-[22px] border border-white/70 bg-white/74 p-3 shadow-[0_18px_60px_rgba(127,29,29,0.10)] backdrop-blur-2xl">
      <div>
        <p className="text-sm font-semibold text-zinc-950">{categoryName}</p>
        <p className="text-xs text-zinc-500">{products.length} позиций</p>
      </div>
      <div className="space-y-3">
        {products.map((product) => {
          const isAdded = selectedProductIds.includes(product.id);

          return (
            <div key={product.id} className="flex items-center justify-between gap-3 rounded-[18px] border border-red-950/10 bg-white/78 px-4 py-3 shadow-sm shadow-red-950/5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-950">{product.name}</p>
                <p className="mt-1 truncate text-sm text-zinc-500">
                  {formatInventoryQuantity(product.stockQuantity)} {product.unit}
                  {product.sku ? ` • ${product.sku}` : ""}
                </p>
                {productNote ? <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-amber-700">{productNote(product)}</p> : null}
              </div>
              <button type="button" onClick={() => onAddProduct(product.id)} disabled={isAdded} className="inline-flex h-9 shrink-0 items-center rounded-full border border-red-100 bg-white/85 px-4 text-xs font-semibold text-red-800 transition hover:border-red-800 hover:bg-red-800 hover:text-white disabled:cursor-not-allowed disabled:border-red-950/10 disabled:bg-white/60 disabled:text-zinc-300">
                {isAdded ? "Добавлено" : "Добавить"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
