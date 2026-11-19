import { createContext, useContext, useState, useEffect, useRef } from "react";
import {
  getAllOrders,
  createOrder as apiCreateOrder,
  updateOrderStatus as apiUpdateOrderStatus,
  deleteOrder as apiDeleteOrder,
} from "../services/ordersServices";
import { getAllMenuItems } from "../services/menuItemServices";
import DEFAULT_MENU_ITEMS from "../data/menuSeedData";

const OrderContext = createContext();

export { DEFAULT_MENU_ITEMS };

export function playKitchenChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";

    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.setValueAtTime(880, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

    osc.start(now);
    osc.stop(now + 0.7);
  } catch (err) {
    console.warn("Kitchen chime audio playback prevented or unavailable:", err);
  }
}

function getStatusColor(status) {
  if (status === "In Kitchen") {
    return "bg-amber-500/15 border-amber-500/30 text-amber-500";
  }
  if (status === "Ready to Serve") {
    return "bg-blue-500/15 border-blue-500/30 text-blue-500";
  }
  if (status === "Completed") {
    return "bg-emerald-500/15 border-emerald-500/30 text-emerald-500";
  }
  return "bg-slate-500/15 border-slate-500/30 text-slate-400";
}

function mapServerOrder(raw) {
  let parsedItems = [];
  try {
    parsedItems = typeof raw.items === "string" ? JSON.parse(raw.items) : raw.items || [];
  } catch {
    parsedItems = [];
  }

  const createdDate = raw.createdAt ? new Date(raw.createdAt) : new Date();
  const timeFormatted = createdDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const numAmount = parseFloat(raw.amount) || 0;

  return {
    dbId: raw.id,
    id: raw.orderId || `#ORD-${raw.id}`,
    table: raw.table || "Table 01",
    guests: raw.guests || 2,
    timestamp: timeFormatted,
    status: raw.status || "In Kitchen",
    statusColor: getStatusColor(raw.status || "In Kitchen"),
    servingOption: raw.servingMode || "Waiter Service (Table)",
    payment: raw.paymentMethod || "UPI",
    paid: Boolean(raw.isPaid),
    amount: `₹${Math.round(numAmount)}`,
    numericAmount: numAmount,
    note: raw.note || "None",
    customerName: raw.customerName || "Diner Guest",
    customerPhone: raw.customerPhone || "",
    items: parsedItems.map((it) => ({
      name: it.name || "Special Item",
      qty: it.qty || 1,
      price: typeof it.price === "number" ? `₹${it.price * (it.qty || 1)}` : it.price || "₹0",
      unitPrice: it.unitPrice || it.price,
    })),
  };
}

function mapServerMenuItem(item) {
  return {
    id: item.id,
    name: item.name,
    category: item.category || "Main Course",
    price: parseFloat(item.price) || 0,
    isVeg: item.isVeg !== undefined ? Boolean(item.isVeg) : item.diet === "Vegetarian",
    diet: item.diet || (item.isVeg ? "Vegetarian" : "Non-Vegetarian"),
    isAvailable: item.isAvailable !== undefined ? Boolean(item.isAvailable) : true,
    description: item.description || "",
    image:
      item.image ||
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
  };
}

export function OrderProvider({ children }) {
  // Only real DB orders & menu items - nothing hardcoded
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState(DEFAULT_MENU_ITEMS);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const knownOrderIds = useRef(new Set());
  const initialLoadDone = useRef(false);

  const syncMenuItemsFromBackend = async () => {
    try {
      const res = await getAllMenuItems();
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setMenuItems(res.data.map(mapServerMenuItem));
      }
    } catch (err) {
      console.warn("Could not sync menu items from DB:", err.message);
    }
  };

  useEffect(() => {
    syncMenuItemsFromBackend();
  }, []);

  // Clean out any legacy mock orders stored in localStorage
  useEffect(() => {
    try {
      localStorage.removeItem("quicktable_live_orders");
    } catch {
      // ignore
    }
  }, []);

  const syncOrdersFromBackend = async () => {
    try {
      const res = await getAllOrders();
      if (res && res.success && Array.isArray(res.data)) {
        const serverMapped = res.data.map(mapServerOrder);

        if (initialLoadDone.current) {
          const newFromOthers = serverMapped.filter(
            (so) => !knownOrderIds.current.has(so.id)
          );

          if (newFromOthers.length > 0) {
            playKitchenChime();
            setNewOrderAlert(newFromOthers[0]);
            setTimeout(() => setNewOrderAlert(null), 6000);
          }
        }

        serverMapped.forEach((o) => knownOrderIds.current.add(o.id));
        setOrders(serverMapped);
        initialLoadDone.current = true;
      }
    } catch (err) {
      console.warn("Backend orders sync error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    syncOrdersFromBackend();
    const interval = setInterval(syncOrdersFromBackend, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let channel;
    try {
      channel = new BroadcastChannel("quicktable_order_sync_channel");
      channel.onmessage = (event) => {
        const { type } = event.data;
        if (type === "NEW_ORDER" || type === "UPDATE_STATUS" || type === "DELETE_ORDERS") {
          syncOrdersFromBackend();
        }
      };
    } catch (e) {
      console.warn("BroadcastChannel not supported in this environment", e);
    }

    return () => {
      if (channel) channel.close();
    };
  }, []);

  const placeOrder = async ({
    tableNumber,
    items,
    customerName,
    customerPhone,
    note,
    servingOption = "Waiter Service (Table)",
    paymentMethod = "Cash/Counter",
    paid = false,
  }) => {
    const rawTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const tax = Math.round(rawTotal * 0.05);
    const finalTotal = rawTotal + tax;

    const formattedTable = tableNumber.toString().padStart(2, "0");
    const newOrderId = `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderPayload = {
      orderId: newOrderId,
      table: `Table ${formattedTable}`,
      guests: 2,
      items: items.map((it) => ({
        name: it.name,
        qty: it.qty,
        price: `₹${it.price * it.qty}`,
        unitPrice: it.price,
      })),
      itemsSummary: items.map((it) => `${it.qty}x ${it.name}`).join(", "),
      note: note && note.trim() ? note.trim() : "None",
      servingMode: servingOption.includes("Pickup") ? "Self-Pickup" : "Waiter",
      amount: finalTotal,
      paymentMethod: paymentMethod,
      isPaid: Boolean(paid),
    };

    let createdOrder = null;

    try {
      const backendRes = await apiCreateOrder(orderPayload);
      if (backendRes && backendRes.success && backendRes.data) {
        createdOrder = mapServerOrder(backendRes.data);
      }
    } catch (err) {
      console.warn("Could not save order to server database:", err.message);
    }

    if (!createdOrder) {
      createdOrder = {
        id: newOrderId,
        table: `Table ${formattedTable}`,
        guests: 2,
        
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "In Kitchen",
        statusColor: "bg-amber-500/15 border-amber-500/30 text-amber-500",
        servingOption: servingOption || "Waiter Service (Table)",
        payment: paymentMethod,
        paid: Boolean(paid),
        amount: `₹${finalTotal}`,
        numericAmount: finalTotal,
        subtotal: rawTotal,
        tax: tax,
        note: note && note.trim() ? note.trim() : "None",
        customerName: customerName && customerName.trim() ? customerName.trim() : "Diner Guest",
        customerPhone: customerPhone || "",
        items: items.map((it) => ({
          name: it.name,
          qty: it.qty,
          price: `₹${it.price * it.qty}`,
          unitPrice: it.price,
        })),
      };
    }

    knownOrderIds.current.add(createdOrder.id);
    setOrders((prev) => [createdOrder, ...prev.filter((o) => o.id !== createdOrder.id)]);

    try {
      const channel = new BroadcastChannel("quicktable_order_sync_channel");
      channel.postMessage({ type: "NEW_ORDER", payload: createdOrder });
      channel.close();
    } catch {
      // fallback
    }

    playKitchenChime();

    return createdOrder;
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    let statusColor = "bg-amber-500/15 border-amber-500/30 text-amber-500";
    if (newStatus === "Ready to Serve") {
      statusColor = "bg-blue-500/15 border-blue-500/30 text-blue-500";
    } else if (newStatus === "Completed") {
      statusColor = "bg-emerald-500/15 border-emerald-500/30 text-emerald-500";
    }

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return { ...ord, status: newStatus, statusColor };
        }
        return ord;
      })
    );

    try {
      const channel = new BroadcastChannel("quicktable_order_sync_channel");
      channel.postMessage({
        type: "UPDATE_STATUS",
        payload: { id: orderId, status: newStatus, statusColor },
      });
      channel.close();
    } catch {
      // fallback
    }

    const currentOrder = orders.find((o) => o.id === orderId);
    const dbId = currentOrder?.dbId;
    if (dbId) {
      try {
        await apiUpdateOrderStatus(dbId, newStatus);
      } catch (err) {
        console.warn("Status update API error:", err.message);
      }
    }
  };

  const deleteOrders = async (orderIds) => {
    const idsToDelete = Array.isArray(orderIds) ? orderIds : [orderIds];
    const targets = orders.filter((ord) => idsToDelete.includes(ord.id));

    setOrders((prev) => prev.filter((ord) => !idsToDelete.includes(ord.id)));

    try {
      const channel = new BroadcastChannel("quicktable_order_sync_channel");
      channel.postMessage({
        type: "DELETE_ORDERS",
        payload: { ids: idsToDelete },
      });
      channel.close();
    } catch {
      // fallback
    }

    for (const target of targets) {
      if (target.dbId) {
        try {
          await apiDeleteOrder(target.dbId);
        } catch (err) {
          console.warn("Order delete API error:", err.message);
        }
      }
    }
  };

  const getTableActiveOrder = (tableNumber) => {
    const formatted = `Table ${tableNumber.toString().padStart(2, "0")}`;
    return orders.find(
      (ord) => ord.table === formatted && (ord.status === "In Kitchen" || ord.status === "Ready to Serve")
    );
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        menuItems,
        placeOrder,
        updateOrderStatus,
        deleteOrders,
        getTableActiveOrder,
        newOrderAlert,
        setNewOrderAlert,
        playKitchenChime,
        syncOrdersFromBackend,
        syncMenuItemsFromBackend,
        isLoading,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
}
