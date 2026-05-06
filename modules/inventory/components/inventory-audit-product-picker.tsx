"use client";

import { useState } from "react";
import { formatInventoryQuantity } from "@/modules/inventory/inventory.format";
import type {
  ProductCategory,
  ProductItem,
} from "@/modules/inventory/inventory.types";

export function InventoryAuditProductPicker({
  query,
  products,
  allProducts,
  categorySummaries,
  selectedProductIds,
  onQueryChange,
  onToggleProduct,
  onSelectProducts,
}: {
  query: string;
  products: ProductItem[];
  allProducts: ProductItem[];
  categorySummaries: Array<{ category: ProductCategory; count: number }>;
  selectedProductIds: number[];
  onQueryChange: (value: string) => void;
  onToggleProduct: (productId: number) => void;
  onSelectProducts: (productIds: number[]) => void;
}) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAllButtonActive, setIsAllButtonActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "">("");
  const categoryProducts = selectedCategory
    ? allProducts.filter((product) => product.category === selectedCategory)
    : [];

  function selectAllProducts() {
    setIsAllButtonActive(true);
    onSelectProducts(allProducts.map((product) => product.id));
  }

  function selectCategoryProducts() {
    setIsAllButtonActive(false);
    onSelectProducts(categoryProducts.map((product) => product.id));
  }

  function toggleProduct(productId: number) {
    setIsAllButtonActive(false);
    onToggleProduct(productId);
  }

  return (
    <div className="space-y-2.5 rounded-[20px] border border-red-950/10 bg-white/62 p-3">
      <label className="space-y-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">Поиск по товарам</span>
        <input type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Например: сыр, кетчуп или PRD-00017" className="h-9 w-full rounded-full border border-red-950/10 bg-white/90 px-4 text-[13px] font-medium tracking-[-0.01em] text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-300 focus:ring-2 focus:ring-red-800/10" />
      </label>

      <LiveProductResults
        query={query}
        products={products}
        selectedProductIds={selectedProductIds}
        onToggleProduct={toggleProduct}
      />

      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={selectAllProducts} className={["h-9 rounded-full border px-4 text-[13px] font-medium tracking-[-0.01em] shadow-sm transition hover:border-red-800 hover:bg-red-800 hover:text-white", isAllButtonActive ? "border-red-800 bg-red-800 text-white shadow-red-950/15" : "border-red-100 bg-white/90 text-red-800 shadow-red-950/5"].join(" ")}>
          Выбрать все
        </button>
        <button type="button" onClick={() => { setIsAllButtonActive(false); setIsCategoryOpen((current) => !current); }} className={["h-9 rounded-full border px-4 text-[13px] font-medium tracking-[-0.01em] shadow-sm shadow-red-950/5 transition", isCategoryOpen ? "border-red-800 bg-red-800 text-white" : "border-red-100 bg-white/90 text-red-800 hover:border-red-800 hover:bg-red-800 hover:text-white"].join(" ")}>
          Выбрать категории
        </button>
      </div>

      {isCategoryOpen ? (
        <div className="rounded-[18px] border border-red-950/10 bg-white/78 p-2.5 shadow-sm shadow-red-950/5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-800/55">Категории склада</p>
          <div className="flex flex-wrap gap-2">
            {categorySummaries.map((item) => (
              <button key={item.category} type="button" onClick={() => setSelectedCategory(item.category)} className={["rounded-full px-3 py-1.5 text-xs font-medium tracking-[-0.01em] transition", selectedCategory === item.category ? "bg-red-800 text-white shadow-sm shadow-red-950/15" : "border border-red-100 bg-white/85 text-red-800 hover:bg-red-50"].join(" ")}>
                {item.category} {item.count}
              </button>
            ))}
          </div>
          <button type="button" disabled={!selectedCategory || categoryProducts.length === 0} onClick={selectCategoryProducts} className="mt-2 h-9 w-full rounded-full bg-red-800 px-4 text-[13px] font-medium tracking-[-0.01em] text-white shadow-sm shadow-red-950/15 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-red-100 disabled:text-red-300 disabled:shadow-none">
            Выбрать
          </button>
        </div>
      ) : null}
    </div>
  );
}

function LiveProductResults({
  query,
  products,
  selectedProductIds,
  onToggleProduct,
}: {
  query: string;
  products: ProductItem[];
  selectedProductIds: number[];
  onToggleProduct: (productId: number) => void;
}) {
  if (!query.trim()) {
    return <p className="rounded-[16px] border border-dashed border-red-200 bg-white/55 px-4 py-3 text-xs leading-5 text-zinc-500">Начни вводить название, и товары появятся прямо здесь.</p>;
  }

  if (products.length === 0) {
    return <p className="rounded-[16px] border border-dashed border-red-200 bg-white/55 px-4 py-3 text-xs leading-5 text-zinc-500">По этому запросу товары не найдены.</p>;
  }

  return (
    <div className="max-h-72 space-y-2 overflow-y-auto rounded-[18px] border border-red-950/10 bg-white/58 p-2">
      {products.map((product) => (
        <ProductResultButton
          key={product.id}
          product={product}
          isSelected={selectedProductIds.includes(product.id)}
          onClick={() => onToggleProduct(product.id)}
        />
      ))}
    </div>
  );
}

function ProductResultButton({ product, isSelected, onClick }: { product: ProductItem; isSelected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`grid w-full gap-3 rounded-[16px] border px-3 py-2.5 text-left transition lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center ${isSelected ? "border-red-200 bg-red-50/85" : "border-red-950/10 bg-white/75 hover:border-red-200 hover:bg-white"}`}>
      <span className={`mt-0.5 h-4 w-4 rounded-full border ${isSelected ? "border-red-800 bg-red-800" : "border-red-200 bg-white"}`} />
      <span>
        <span className="block text-[13px] font-semibold tracking-[-0.01em] text-zinc-950">{product.name}</span>
        <span className="mt-0.5 block text-xs text-zinc-500">{product.category ?? "Без категории"}{product.sku ? ` • ${product.sku}` : ""}</span>
      </span>
      <span className="text-xs font-semibold text-zinc-600">
        Остаток: {formatInventoryQuantity(product.stockQuantity)} {product.unit}
      </span>
    </button>
  );
}
