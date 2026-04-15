import type { Product } from "../types";

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 capitalize">
            {product.category}
          </p>
        </div>
        <span className="text-sm font-bold text-indigo-600 whitespace-nowrap">
          ${product.price}
        </span>
      </div>

      {product.description && (
        <p className="text-xs text-gray-600 mt-2 leading-relaxed line-clamp-2">
          {product.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex flex-wrap gap-1">
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <span
          className={`text-xs font-medium ${product.inStock ? "text-green-600" : "text-red-400"}`}
        >
          {product.inStock ? "In stock" : "Out of stock"}
        </span>
      </div>
    </div>
  );
}
