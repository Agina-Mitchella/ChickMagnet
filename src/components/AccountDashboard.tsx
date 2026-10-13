import { ChevronRight, LayoutDashboard, Package, ShoppingBag, User as UserIcon } from 'lucide-react';
import { BuyerType, User } from '../types';

interface AccountDashboardProps {
  currentUser?: User | null;
  buyerType: BuyerType;
  userOrders?: any[];
  onOpenClaims: () => void;
  onNavigateToShop: () => void;
  onOpenAdmin?: () => void;
}

function formatMoney(value: unknown) {
  const amount = Number(value || 0);
  return `Ksh ${Number.isFinite(amount) ? amount.toLocaleString() : '0'}`;
}

export default function AccountDashboard({
  currentUser,
  buyerType,
  userOrders = [],
  onOpenClaims,
  onNavigateToShop,
  onOpenAdmin
}: AccountDashboardProps) {
  const isAdmin = Boolean(
    currentUser?.customClaims?.admin === true || currentUser?.customClaims?.role === 'ADMIN'
  );
  const customerType = (currentUser?.buyerType || buyerType) === 'wholesale'
    ? 'Commercial wholesale'
    : 'Retail';

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <UserIcon className="mx-auto h-9 w-9 text-emerald-800" />
          <h1 className="mt-4 text-2xl font-black text-emerald-950">Sign in to view your account</h1>
          <p className="mt-2 text-sm text-slate-600">Your orders will appear here after checkout.</p>
          <button
            type="button"
            onClick={onNavigateToShop}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-900 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800"
          >
            Browse products
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 text-emerald-950 sm:px-6 lg:px-8">
      <section className="rounded-3xl bg-[#123524] p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-amber-400 text-xl font-black text-emerald-950">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="" className="h-full w-full object-cover" />
              ) : (
                currentUser.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-200">
                {currentUser.isGuest ? 'Guest checkout' : 'My account'}
              </p>
              <h1 className="truncate text-2xl font-black text-amber-300 sm:text-3xl">{currentUser.name}</h1>
              <p className="truncate text-sm text-emerald-100/80">
                {currentUser.isGuest ? 'Orders saved to this browser' : currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-emerald-50">{customerType}</span>
            {isAdmin && onOpenAdmin ? (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-xs font-black text-emerald-950 hover:bg-amber-300"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin
              </button>
            ) : null}
            <button
              type="button"
              onClick={onNavigateToShop}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/15"
            >
              <ShoppingBag className="h-4 w-4" />
              Shop
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="recent-orders-heading">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">Order history</p>
            <h2 id="recent-orders-heading" className="mt-1 text-xl font-black text-emerald-950">Recent orders</h2>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
            {userOrders.length} {userOrders.length === 1 ? 'order' : 'orders'}
          </span>
        </div>

        {userOrders.length === 0 ? (
          <div className="py-14 text-center">
            <Package className="mx-auto h-9 w-9 text-slate-300" />
            <h3 className="mt-4 text-base font-bold text-emerald-950">No orders yet</h3>
            <p className="mt-1 text-sm text-slate-600">
              {currentUser.isGuest
                ? 'Guest orders submitted in this browser will appear here.'
                : 'Orders you submit will be saved to this account.'}
            </p>
            <button
              type="button"
              onClick={onNavigateToShop}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-black text-emerald-950 hover:bg-amber-300"
            >
              Explore products
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {userOrders.map((order) => (
              <article key={order.id} className="py-5 last:pb-0">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-black text-emerald-950">{order.id}</span>
                      {order.date ? <span className="text-xs text-slate-500">{order.date}</span> : null}
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-900">
                        {order.status || 'Payment confirmation pending'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-800">{order.items || 'Order details pending'}</p>
                    {order.eta ? <p className="text-xs text-slate-600">Delivery: {order.eta}</p> : null}
                    {order.paymentConfirmationStatus === 'pending_manual_review' ? (
                      <p className="text-xs text-slate-600">M-Pesa confirmation is awaiting review.</p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                    <strong className="text-base text-emerald-950">{formatMoney(order.total ?? order.grandTotal)}</strong>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={onOpenClaims}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Report an issue
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
