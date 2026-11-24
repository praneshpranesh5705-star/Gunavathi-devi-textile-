"use client";

import { useActionState, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import ProductEditor from "@/components/admin/ProductEditor";
import {
  deleteProductAction,
  moveProductAction,
  togglePublishedAction,
} from "@/app/admin/actions";
import type { ActionState, Product } from "@/lib/types";

/**
 * The admin dashboard.
 *
 * Lists every product — including drafts, which only a signed-in owner can
 * see — and offers add, edit, delete, reorder and publish/hide.
 *
 * Every button submits a Server Action. The database is what actually enforces
 * who may write; this UI only decides what to show.
 */
export default function AdminDashboard({
  products,
  email,
}: {
  products: Product[];
  email: string;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const orderedIds = products.map((p) => p.id).join(",");

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      {/* ------------------------------------------------------------------ */}
      {/* Summary bar                                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-2xl p-6 border border-black/5 flex flex-wrap items-center justify-between gap-5">
        <div>
          <h2 className="font-serif text-2xl">Your catalogue</h2>
          <p className="muted text-sm mt-1">
            {products.length} product{products.length === 1 ? "" : "s"} •{" "}
            {products.filter((p) => p.published).length} visible on the website •{" "}
            {products.filter((p) => !p.published).length} hidden
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setAdding(true);
            setEditing(null);
          }}
          className="bg-brand text-white rounded-xl px-5 py-3 font-bold flex items-center gap-2 hover:bg-deep transition"
        >
          <Plus size={18} /> Add product
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Add form                                                           */}
      {/* ------------------------------------------------------------------ */}
      {adding && (
        <div className="mt-6">
          <ProductEditor onDone={() => setAdding(false)} />
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Product list                                                       */}
      {/* ------------------------------------------------------------------ */}
      {products.length === 0 && !adding ? (
        <div className="mt-6 bg-white rounded-2xl border border-black/5 p-12 text-center">
          <h3 className="font-serif text-2xl">No products yet</h3>
          <p className="muted mt-2">
            Add your first product and it will appear on the website straight away.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {products.map((p, index) => (
            <div key={p.id}>
              <ProductRow
                product={p}
                index={index}
                total={products.length}
                orderedIds={orderedIds}
                isEditing={editing === p.id}
                onEdit={() => {
                  setEditing(editing === p.id ? null : p.id);
                  setAdding(false);
                }}
                onDeleteRequest={() => setConfirmDelete(p.id)}
              />

              {editing === p.id && (
                <div className="mt-4">
                  <ProductEditor product={p} onDone={() => setEditing(null)} />
                </div>
              )}

              {confirmDelete === p.id && (
                <DeleteConfirm
                  product={p}
                  onCancel={() => setConfirmDelete(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <p className="muted-soft text-xs mt-10 leading-6">
        Signed in as <b>{email}</b>. Product details and photos are stored in Supabase, so changes
        made here appear on every device — including your phone.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* One row                                                                    */
/* -------------------------------------------------------------------------- */

function ProductRow({
  product,
  index,
  total,
  orderedIds,
  isEditing,
  onEdit,
  onDeleteRequest,
}: {
  product: Product;
  index: number;
  total: number;
  orderedIds: string;
  isEditing: boolean;
  onEdit: () => void;
  onDeleteRequest: () => void;
}) {
  const [toggleState, toggleAction, togglePending] = useActionState<ActionState, FormData>(
    togglePublishedAction,
    {},
  );
  const [moveState, moveAction, movePending] = useActionState<ActionState, FormData>(
    moveProductAction,
    {},
  );

  const busy = togglePending || movePending;

  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-5 p-5">
        {/* Thumbnail */}
        <div className="w-full sm:w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-cream border border-black/5">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full grid place-items-center muted-soft text-xs">
              No image
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif text-xl">{product.name}</h3>
            {product.published ? (
              <span className="text-[11px] font-bold uppercase tracking-wider bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                Live
              </span>
            ) : (
              <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                Draft
              </span>
            )}
          </div>

          <p className="muted text-sm mt-1">
            <b className="text-deep">{product.price}</b> {product.unit} • {product.category}
          </p>
          <p className="muted-soft text-sm mt-2 line-clamp-2">{product.description}</p>

          {(toggleState.error || moveState.error) && (
            <p className="mt-2 text-xs text-red-700 flex items-center gap-1.5">
              <AlertCircle size={13} /> {toggleState.error ?? moveState.error}
            </p>
          )}
          {(toggleState.success || moveState.success) && (
            <p className="mt-2 text-xs text-green-800 flex items-center gap-1.5">
              <CheckCircle2 size={13} /> {toggleState.success ?? moveState.success}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex sm:flex-col gap-2 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 sm:flex-none border border-black/10 rounded-lg px-4 py-2 text-sm font-semibold flex items-center justify-center gap-2 hover:border-brand hover:text-brand"
          >
            <Pencil size={15} /> {isEditing ? "Close" : "Edit"}
          </button>

          {/* Publish / hide */}
          <form action={toggleAction} className="flex-1 sm:flex-none">
            <input type="hidden" name="id" value={product.id} />
            <input type="hidden" name="published" value={String(!product.published)} />
            <button
              type="submit"
              disabled={busy}
              className="w-full border border-black/10 rounded-lg px-4 py-2 text-sm font-semibold flex items-center justify-center gap-2 hover:border-brand hover:text-brand disabled:opacity-50"
            >
              {togglePending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : product.published ? (
                <EyeOff size={15} />
              ) : (
                <Eye size={15} />
              )}
              {product.published ? "Hide" : "Show"}
            </button>
          </form>

          {/* Reorder */}
          <div className="flex gap-2">
            <form action={moveAction} className="flex-1">
              <input type="hidden" name="id" value={product.id} />
              <input type="hidden" name="direction" value="up" />
              <input type="hidden" name="orderedIds" value={orderedIds} />
              <button
                type="submit"
                disabled={busy || index === 0}
                aria-label={`Move ${product.name} up`}
                className="w-full border border-black/10 rounded-lg px-3 py-2 flex items-center justify-center hover:border-brand hover:text-brand disabled:opacity-30"
              >
                <ArrowUp size={15} />
              </button>
            </form>
            <form action={moveAction} className="flex-1">
              <input type="hidden" name="id" value={product.id} />
              <input type="hidden" name="direction" value="down" />
              <input type="hidden" name="orderedIds" value={orderedIds} />
              <button
                type="submit"
                disabled={busy || index === total - 1}
                aria-label={`Move ${product.name} down`}
                className="w-full border border-black/10 rounded-lg px-3 py-2 flex items-center justify-center hover:border-brand hover:text-brand disabled:opacity-30"
              >
                <ArrowDown size={15} />
              </button>
            </form>
          </div>

          <button
            type="button"
            onClick={onDeleteRequest}
            className="flex-1 sm:flex-none border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-50"
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Delete confirmation                                                        */
/* -------------------------------------------------------------------------- */

function DeleteConfirm({ product, onCancel }: { product: Product; onCancel: () => void }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(deleteProductAction, {});

  return (
    <div className="mt-3 bg-red-50 border border-red-200 rounded-2xl p-5">
      <p className="text-sm text-red-900">
        Delete <b>{product.name}</b> permanently? This cannot be undone. The photo stays in storage
        but the product is removed from the website.
      </p>

      {state.error && <p className="mt-2 text-xs text-red-800">{state.error}</p>}

      <div className="flex gap-3 mt-4">
        <form action={action}>
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="name" value={product.name} />
          <button
            type="submit"
            disabled={pending}
            className="bg-red-700 text-white rounded-lg px-5 py-2.5 text-sm font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {pending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            {pending ? "Deleting…" : "Yes, delete it"}
          </button>
        </form>
        <button
          type="button"
          onClick={onCancel}
          className="border border-black/10 bg-white rounded-lg px-5 py-2.5 text-sm font-semibold"
        >
          Keep it
        </button>
      </div>
    </div>
  );
}
