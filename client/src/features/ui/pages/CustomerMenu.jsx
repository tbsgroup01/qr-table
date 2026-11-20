import React, { useState, useMemo, useEffect, Component } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { useOrders } from "../../../context/OrderContext";
import logo from "../../../assets/qr.png";
import CustomerGameModal from "../components/CustomerGameModal";

class SafeModalBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("Modal caught error:", error, info);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
import {
  UtensilsCrossed,
  Search,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Flame,
  X,
  CreditCard,
  Banknote,
  Send,
  RotateCcw,
  BellRing,
  Check,
  UserCheck,
  Trophy,
  QrCode,
  Smartphone,
} from "lucide-react";

export default function CustomerMenu() {
  const { tableId } = useParams();
  const [searchParams] = useSearchParams();
  const queryTable = searchParams.get("table") || searchParams.get("tableNumber") || searchParams.get("tableId");
  const rawTableNum = (tableId || queryTable) ? String(tableId || queryTable).replace(/[^0-9]/g, "") || "05" : "05";
  const formattedTableNum = rawTableNum.padStart(2, "0");
  const tableTitle = `Table ${formattedTableNum}`;

  const { menuItems, placeOrder } = useOrders();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);

  // Cart state: { [itemId]: quantity }
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);

  // Checkout inputs
  const [servingOption, setServingOption] = useState("waiter"); // "waiter" or "pickup"
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [cookingNote, setCookingNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash/Counter");
  const [isPlacing, setIsPlacing] = useState(false);

  // Post-order state
  const [placedOrder, setPlacedOrder] = useState(null);
  const [waiterCalled, setWaiterCalled] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [claimedReward, setClaimedReward] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 600, easing: "ease-out-cubic", once: false });
    window.scrollTo(0, 0);
  }, []);

  // Filtered menu
  const filteredDishes = useMemo(() => {
    return menuItems.filter((dish) => {
      const matchesSearch =
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVeg = vegOnly ? dish.isVeg === true : true;
      return matchesSearch && matchesVeg;
    });
  }, [menuItems, searchQuery, vegOnly]);

  // Cart calculations
  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const dish = menuItems.find((d) => d.id === parseInt(id));
        return { ...dish, qty };
      })
      .filter((item) => Boolean(item.id));
  }, [cart, menuItems]);

  const totalCartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.qty, 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cartItems]);

  const tax = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = subtotal + tax;

  // Add / Remove from Cart
  const handleAddToCart = (dishId) => {
    setCart((prev) => ({
      ...prev,
      [dishId]: (prev[dishId] || 0) + 1,
    }));
  };

  const handleRemoveFromCart = (dishId) => {
    setCart((prev) => {
      const current = prev[dishId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[dishId];
        return next;
      }
      return { ...prev, [dishId]: current - 1 };
    });
  };

  // Submit Order to Kitchen
  const executeOrderPlacement = async (isPaidNow) => {
    setIsPlacing(true);
    try {
      const newOrder = await placeOrder({
        tableNumber: formattedTableNum,
        items: cartItems,
        customerName,
        customerPhone,
        note: cookingNote,
        servingOption: servingOption === "pickup" ? "Self-Pickup (Counter)" : "Waiter Service (Table)",
        paymentMethod: isPaidNow ? "UPI" : paymentMethod,
        paid: Boolean(isPaidNow),
      });

      setIsPlacing(false);
      setIsCartOpen(false);
      setShowUpiModal(false);
      setPlacedOrder(newOrder);
      setCart({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setIsPlacing(false);
      console.error("Order error:", err);
    }
  };

  const handlePlaceOrder = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (cartItems.length === 0) return;

    if (paymentMethod === "UPI") {
      setShowUpiModal(true);
      return;
    }

    executeOrderPlacement(false);
  };

  const handleCallWaiter = () => {
    setWaiterCalled(true);
    setTimeout(() => setWaiterCalled(false), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-poppins text-slate-900 pb-28 select-none">
      {/* 1. TOP MOBILE HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-3xl mx-auto px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2">
          {/* Brand & Venue */}
          <div className="flex items-center gap-2.5 min-w-0">
            <img src={logo} alt="QuickTable" className="h-14 w-auto object-contain shrink-0" />
          
           
          </div>

          {/* Table Pill & Waiter Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs shadow-md shadow-orange-500/25 flex items-center gap-1.5 border border-orange-400">
              <UtensilsCrossed size={12} />
              <span>{tableTitle}</span>
            </div>

            
          </div>
        </div>

        {/* Waiter Alert Confirmation Toast */}
        {waiterCalled && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 text-center animate-fade-in flex items-center justify-center gap-2">
            <Check size={14} className="stroke-[3]" />
            <span>Waiter notified for {tableTitle}! Someone is approaching your table.</span>
          </div>
        )}
      </header>

      {/* 2. ORDER SUCCESS SCREEN IF PLACED */}
      {placedOrder ? (
        <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 size={44} className="stroke-[2.5]" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-2">
              <Sparkles size={13} className="text-emerald-600" />
              <span>Order Sent to Kitchen Successfully</span>
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Thank You! Order {placedOrder.id}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
              Chefs have received your order for{" "}
              <strong className="text-slate-900">{placedOrder.table}</strong>. Hot food will be
              served shortly!
            </p>

            {/* Live Progress Stepper */}
            <div className="my-6 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-left">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-4 pb-2 border-b border-slate-200/60">
                <span>Kitchen Live Status</span>
                <span className="text-orange-600 flex items-center gap-1 font-extrabold">
                  <Clock size={13} />
                  <span>Est. 15-20 mins</span>
                </span>
              </div>

              <div className="space-y-0">
                {/* Step 1: Received */}
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-sm shadow-emerald-500/30 shrink-0">
                      <Check size={12} className="stroke-[3]" />
                    </div>
                    <div className="w-0.5 h-10 bg-emerald-400 my-0.5" />
                  </div>
                  <div className="pt-0.5 pb-2">
                    <h4 className="text-xs font-black text-slate-900 leading-tight">Order Received in Kitchen</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Timestamp: {placedOrder.timestamp} • Mode: {placedOrder.payment}
                    </p>
                  </div>
                </div>

                {/* Step 2: Preparing */}
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs shadow-sm shadow-orange-500/30 shrink-0 animate-pulse">
                      <Flame size={12} />
                    </div>
                    <div className="w-0.5 h-10 bg-slate-200 my-0.5" />
                  </div>
                  <div className="pt-0.5 pb-2">
                    <h4 className="text-xs font-black text-orange-600 leading-tight">Chefs Preparing Dishes</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Your tandoor & curries are on the stove right now.
                    </p>
                  </div>
                </div>

                {/* Step 3: Serve or Pickup */}
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs shrink-0">
                      {placedOrder.servingOption?.includes("Pickup") ? (
                        <UserCheck size={12} />
                      ) : (
                        <UtensilsCrossed size={12} />
                      )}
                    </div>
                  </div>
                  <div className="pt-0.5">
                    <h4 className="text-xs font-bold text-slate-600 leading-tight">
                      {placedOrder.servingOption?.includes("Pickup")
                        ? "Self-Pickup at Counter"
                        : `Serve to ${placedOrder.table} by Waiter`}
                    </h4>  
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items Summary */}
            <div className="text-left bg-slate-50/80 rounded-2xl p-4 border border-slate-200/60 mb-6">
              <h4 className="text-xs font-extrabold text-slate-800 mb-2.5">Items in this Ticket:</h4>
              <div className="space-y-1.5 text-xs text-slate-700">
                {placedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span>
                      <strong className="text-slate-900">{item.qty}x</strong> {item.name}
                    </span>
                    <span className="font-bold">{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs font-black text-slate-900">
                <span>Total Amount:</span>
                <span className="text-sm text-orange-600">{placedOrder.amount}</span>
              </div>
            </div>

            {/* Claimed Reward Banner if Won */}
            {claimedReward && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 border-2 border-dashed border-emerald-400 text-left mb-5 animate-fade-in shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25">
                    <Trophy size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider mb-1">
                      <Check size={10} className="stroke-[3]" />
                      <span>Reward Active for {placedOrder.table}</span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 leading-tight">
                      🎉 {claimedReward.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">
                      Inform your waiter at bill payment to claim this dish!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Food Trivia & Arcade Entertainment Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-orange-200 text-left mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/30">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">
                    Bored waiting for food? Win a Free Dessert!
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Play our 2-minute Foodie Challenge right on your phone while your chef cooks.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsGameOpen(true)}
                    className="inline-flex items-center gap-1.5 mt-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/25 transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    <span>Play Arcade & Trivia Now</span>
                    <ChevronRight size={13} className="stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPlacedOrder(null)}
              className="w-full py-3.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw size={15} />
              <span>Order More Items for {placedOrder.table}</span>
            </button>
          </div>
        </div>
      ) : (
        /* 3. MAIN MENU CONTENT */
        <main className="max-w-3xl mx-auto px-4 pt-3">
          {/* Compact Welcome Card */}
          <div className="rounded-2xl p-3.5 sm:p-4 bg-gradient-to-r from-[#02241b] via-[#043324] to-[#031d16] text-white shadow-md relative overflow-hidden mb-3">
            <div className="flex items-center justify-between gap-3 relative z-10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-emerald-300">
                  <Sparkles size={10} className="text-amber-400" />
                  <span>Dine-in Instant Ordering</span>
                </div>
                <h1 className="mt-0.5 text-base sm:text-lg font-black tracking-tight">
                  Seated at <span className="text-orange-400">{tableTitle}</span>
                </h1>
                <p className="text-[10px] text-emerald-100/70">
                  Order gourmet food served straight to your table
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 text-[11px] font-bold text-amber-300 border border-white/15">
                  <Clock size={12} />
                  <span>15-20 min</span>
                </span>
              </div>
            </div>
          </div>

          {/* Sticky Search & Category Bar */}
          <div className="sticky top-[53px] z-20 bg-slate-50/95 backdrop-blur-md pt-1 pb-2.5 space-y-2 border-b border-slate-200/60 -mx-4 px-4 shadow-xs">
            {/* Search Input + Veg Toggle */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search dishes (e.g. Butter Chicken)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 shadow-xs font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Pure Veg Toggle */}
              <button
                type="button"
                onClick={() => setVegOnly(!vegOnly)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs ${
                  vegOnly
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-emerald-500/20"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="w-3.5 h-3.5 rounded border border-current flex items-center justify-center p-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                </span>
                <span>Veg Only</span>
              </button>
            </div>
          </div>

          {/* Dishes Count Header */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 py-1.5 px-1">
            <span>Showing {filteredDishes.length} dishes</span>
            <span>{tableTitle}</span>
          </div>

          {/* 4. DISHES LIST */}
          <div className="space-y-3 pb-4">
            {filteredDishes.map((dish) => {
              const currentQty = cart[dish.id] || 0;
              return (
                <div
                  key={dish.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-start justify-between gap-3 relative"
                >
                  {/* Left: Dish Details */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center p-0.5 shrink-0 ${
                          dish.isVeg
                            ? "border-emerald-600 text-emerald-600"
                            : "border-red-600 text-red-600"
                        }`}
                        title={dish.isVeg ? "Vegetarian" : "Non-Vegetarian"}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            dish.isVeg ? "bg-emerald-600" : "bg-red-600"
                          }`}
                        />
                      </span>
                    </div>

                    <h3 className="font-black text-sm sm:text-base text-slate-900 leading-snug">
                      {dish.name}
                    </h3>

                    <div className="mt-1 font-black text-sm text-slate-900">
                      ₹{dish.price}
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-1">
                      {dish.description}
                    </p>
                  </div>

                  {/* Right: Dish Image + Overlapping ADD Button */}
                  <div className="relative shrink-0 flex flex-col items-center">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 shadow-xs relative">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-full h-full object-cover object-center select-none"
                        loading="lazy"
                      />
                      {dish.badge && (
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-orange-600 text-[8px] font-black text-white uppercase tracking-wider flex items-center gap-0.5 shadow-xs">
                          <Flame size={9} />
                          <span>{dish.badge}</span>
                        </span>
                      )}
                    </div>

                    {/* Quantity Selector Overlapping Bottom Edge */}
                    <div className="-mt-3.5 z-10">
                      {currentQty > 0 ? (
                        <div className="flex items-center gap-2 bg-orange-50 border border-orange-300 rounded-full p-0.5 shadow-md">
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(dish.id)}
                            className="w-6 h-6 rounded-full bg-white text-orange-600 hover:bg-orange-100 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                          >
                            <Minus size={11} className="stroke-[3]" />
                          </button>
                          <span className="w-4 text-center font-black text-xs text-orange-600">
                            {currentQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddToCart(dish.id)}
                            className="w-6 h-6 rounded-full bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                          >
                            <Plus size={11} className="stroke-[3]" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddToCart(dish.id)}
                          className="px-4 py-1 rounded-full text-xs font-black text-orange-600 bg-white border border-orange-200 hover:bg-orange-500 hover:text-white hover:border-orange-500 shadow-md transition-all duration-200 cursor-pointer flex items-center gap-1 active:scale-95"
                        >
                          <Plus size={12} className="stroke-[3]" />
                          <span>ADD</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredDishes.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6">
              <UtensilsCrossed size={36} className="mx-auto text-slate-300 mb-2" />
              <h4 className="text-sm font-black text-slate-800">No matching dishes found</h4>
              <p className="text-xs text-slate-400 mt-1">
                Try searching with a different keyword or turn off the veg-only filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                  setVegOnly(false);
                }}
                className="mt-3 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      )}

      {/* 5. STICKY FLOATING CART BAR */}
      {totalCartCount > 0 && !placedOrder && (
        <div className="fixed bottom-4 inset-x-0 z-40 px-4 max-w-lg mx-auto animate-fade-in-up">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black shadow-md shadow-orange-500/30">
                <ShoppingBag size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300">
                    {totalCartCount} {totalCartCount === 1 ? "Item" : "Items"}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 font-bold text-amber-400">
                    {tableTitle}
                  </span>
                </div>
                <div className="text-base font-black text-white">
                  ₹{grandTotal}{" "}
                  <span className="text-[10px] text-slate-400 font-normal">incl. taxes</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="px-5 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/30 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <span>View Order</span>
              <ChevronRight size={15} className="stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* 6. SLIDE-UP CHECKOUT / CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base sm:text-lg text-slate-900">
                    Your Table Order
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-50 text-orange-600 border border-orange-200">
                    {tableTitle}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Review selected items before sending to the kitchen
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Order Items List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            item.isVeg ? "bg-emerald-600" : "bg-red-600"
                          }`}
                        />
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        ₹{item.price} x {item.qty} ={" "}
                        <strong className="text-slate-900 font-bold">
                          ₹{item.price * item.qty}
                        </strong>
                      </p>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full p-1 shadow-xs shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center"
                      >
                        <Minus size={11} className="stroke-[3]" />
                      </button>
                      <span className="w-4 text-center font-black text-xs text-slate-900">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item.id)}
                        className="w-6 h-6 rounded-full bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center"
                      >
                        <Plus size={11} className="stroke-[3]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Special Cooking Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Special Cooking Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Less spicy, extra butter on naan, no green chili..."
                  value={cookingNote}
                  onChange={(e) => setCookingNote(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 resize-none font-medium"
                />
              </div>

              {/* Diner Contact Details (Optional) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Your Name 
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rohit"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Phone 
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="e.g. 98765 00000"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Serving Mode (Khana kaise lenge?)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setServingOption("waiter")}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      servingOption === "waiter"
                        ? "bg-orange-50 border-orange-500 text-orange-700 font-bold shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        servingOption === "waiter"
                          ? "bg-orange-500 text-white shadow-xs"
                          : "bg-white text-slate-500 border border-slate-200"
                      }`}
                    >
                      <UtensilsCrossed size={15} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black leading-tight">By Waiter</div>
                   
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServingOption("pickup")}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      servingOption === "pickup"
                        ? "bg-orange-50 border-orange-500 text-orange-700 font-bold shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        servingOption === "pickup"
                          ? "bg-orange-500 text-white shadow-xs"
                          : "bg-white text-slate-500 border border-slate-200"
                      }`}
                    >
                      <UserCheck size={15} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black leading-tight">Self-Pickup</div>
                    
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  How would you like to pay?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Cash/Counter")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      paymentMethod === "Cash/Counter"
                        ? "bg-orange-50 border-orange-500 text-orange-700 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <Banknote size={16} />
                    <div className="text-[11px] leading-tight">
                      <div className="font-extrabold">Pay at Counter</div>
                      <span className="text-[9px] text-slate-400">Cash / Card after food</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("UPI")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      paymentMethod === "UPI"
                        ? "bg-orange-50 border-orange-500 text-orange-700 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <CreditCard size={16} />
                    <div className="text-[11px] leading-tight">
                      <div className="font-extrabold">Pay via UPI QR</div>
                      <span className="text-[9px] text-slate-400">GPay, PhonePe, Paytm</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Bill Summary */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>GST (2.5% CGST + 2.5% SGST)</span>
                  <span>₹{tax}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-orange-600">₹{grandTotal}</span>
                </div>
              </div>
            </div>

            {/* Sticky Drawer Footer with Submit CTA */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-white">
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isPlacing || cartItems.length === 0}
                className="w-full py-3.5 rounded-full text-xs sm:text-sm font-black text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30 transition-all duration-200 cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isPlacing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Routing to Kitchen...</span>
                  </div>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Place Order to Kitchen ({tableTitle}) • ₹{grandTotal}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPI QR Payment Settlement Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center border border-slate-100 relative animate-fade-in-up">
            <button
              type="button"
              onClick={() => setShowUpiModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center mx-auto mb-3">
              <QrCode size={26} />
            </div>

            <h3 className="text-base font-black text-slate-900">
              Scan & Pay via UPI
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pay ₹{grandTotal} for {tableTitle} using any UPI App
            </p>

            {/* Merchant Standee Card */}
            <div className="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center">
              <div className="bg-white p-3 rounded-xl shadow-xs border border-slate-200/80 mb-2.5">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                    `upi://pay?pa=rajudhaba@icici&pn=RAJU%20DHABA&am=${grandTotal}&tn=Table_${formattedTableNum}_Bill&cu=INR`
                  )}`}
                  alt="UPI Payment QR"
                  className="w-44 h-44 object-contain rounded-lg"
                />
              </div>

              <div className="text-[11px] font-mono font-bold text-slate-700">
                UPI ID: <span className="text-orange-600">rajudhaba@icici</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                RAJU DHABA & RESTAURANT
              </div>

              {/* Direct UPI Intent Link for Mobile Users */}
              <a
                href={`upi://pay?pa=rajudhaba@icici&pn=RAJU%20DHABA&am=${grandTotal}&tn=Table_${formattedTableNum}_Bill&cu=INR`}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-all sm:hidden"
              >
                <Smartphone size={13} />
                <span>Tap to Open in UPI App</span>
              </a>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => executeOrderPlacement(true)}
                disabled={isPlacing}
                className="w-full py-3 rounded-full text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isPlacing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Confirming...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>I Have Paid ₹{grandTotal} • Send to Kitchen</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("Cash/Counter");
                  executeOrderPlacement(false);
                }}
                disabled={isPlacing}
                className="w-full py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Pay Cash at Counter Instead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Interactive Game & Arcade Modal with Error Shield */}
      <SafeModalBoundary>
        <CustomerGameModal
          isOpen={isGameOpen}
          onClose={() => setIsGameOpen(false)}
          tableTitle={tableTitle}
          placedOrder={placedOrder}
          onClaimReward={(reward) => setClaimedReward(reward)}
          onQuizCompleted={(playRecord) => {
            if (playRecord && playRecord.isWinner && playRecord.dish) {
              setClaimedReward({
                title: playRecord.dish,
                source: playRecord.quiz,
              });
            }
          }}
        />
      </SafeModalBoundary>
    </div>
  );
}
