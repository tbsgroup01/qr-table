import { useState, useEffect } from "react";
import {
  UtensilsCrossed,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Leaf,
  Beef,
  UploadCloud,
  Camera,
  List,
  LayoutGrid,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import Cards from "../../../components/Cards";
import {
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  bulkDeleteMenuItems,
  toggleMenuItemAvailability,
  bulkUpdateAvailability,
} from "../../../services/menuItemServices";
import { uploadDishImage } from "../../../services/uploadServices";

export default function Menu() {
  const { isDark } = useTheme();

  const [viewMode, setViewMode] = useState("table"); // "table" | "cards"
  const [dietFilter, setDietFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Bulk Selection & Deletion States
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    isVeg: true,
    description: "",
    isAvailable: true,
    image: "",
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, image: localUrl }));
      try {
        const res = await uploadDishImage(file);
        if (res && res.success && res.url) {
          setFormData((prev) => ({ ...prev, image: res.url }));
        }
      } catch (err) {
        console.warn("Dish image upload error:", err.message);
      }
    }
  };

  const [menuItems, setMenuItems] = useState([]);

  const fetchMenuItems = async () => {
    try {
      const res = await getAllMenuItems();
      if (res && res.success && Array.isArray(res.data)) {
        const formatted = res.data.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category || "Main Course",
          price: parseFloat(item.price) || 0,
          isVeg: item.isVeg !== undefined ? Boolean(item.isVeg) : item.diet === "Vegetarian",
          isAvailable: item.isAvailable !== undefined ? Boolean(item.isAvailable) : true,
          description: item.description || "",
          image:
            item.image ||
            "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
        }));
        setMenuItems(formatted);
      }
    } catch (err) {
      console.warn("Could not fetch menu from DB:", err.message);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const totalItems = menuItems.length;
  const availableCount = menuItems.filter((i) => i.isAvailable).length;
  const outOfStockCount = menuItems.filter((i) => !i.isAvailable).length;
  const vegCount = menuItems.filter((i) => i.isVeg).length;

  const metricCards = [
    {
      title: "Total Menu Items",
      value: totalItems.toString(),
      icon: UtensilsCrossed,
      iconColor: "text-orange-500 dark:text-orange-400",
      iconBg: "bg-orange-500/10 border-orange-500/20",
      glowColor: "from-orange-500/20 via-orange-500/5 to-transparent",
      accentBorder: "hover:border-orange-500/40",
    },
    {
      title: "Available Live Dishes",
      value: availableCount.toString(),
      icon: CheckCircle2,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      glowColor: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      accentBorder: "hover:border-emerald-500/40",
    },
    {
      title: "Out of Stock Items",
      value: outOfStockCount.toString(),
      icon: AlertCircle,
      iconColor: "text-rose-500 dark:text-rose-400",
      iconBg: "bg-rose-500/10 border-rose-500/20",
      glowColor: "from-rose-500/20 via-rose-500/5 to-transparent",
      accentBorder: "hover:border-rose-500/40",
    },
    {
      title: "Vegetarian Dishes",
      value: vegCount.toString(),
      icon: Leaf,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      glowColor: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      accentBorder: "hover:border-emerald-500/40",
    },
  ];

  const handleToggleAvailability = async (id) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
    try {
      await toggleMenuItemAvailability(id);
    } catch (err) {
      console.warn("Toggle availability error:", err.message);
    }
  };

  // Bulk Selection Handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredItems.map((i) => i.id);
    const areAllSelected =
      allFilteredIds.length > 0 &&
      allFilteredIds.every((id) => selectedIds.includes(id));

    if (areAllSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !allFilteredIds.includes(id))
      );
    } else {
      setSelectedIds((prev) => [
        ...prev,
        ...allFilteredIds.filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirm && deleteConfirm.ids.length > 0) {
      const idsToDelete = deleteConfirm.ids;
      setMenuItems((prev) =>
        prev.filter((item) => !idsToDelete.includes(item.id))
      );
      setSelectedIds((prev) =>
        prev.filter((id) => !idsToDelete.includes(id))
      );
      setDeleteConfirm(null);

      try {
        if (idsToDelete.length === 1) {
          await deleteMenuItem(idsToDelete[0]);
        } else {
          await bulkDeleteMenuItems(idsToDelete);
        }
      } catch (err) {
        console.warn("Delete menu item error:", err.message);
      }
    }
  };

  const handleBatchAvailability = async (availability) => {
    const ids = [...selectedIds];
    setMenuItems((prev) =>
      prev.map((item) =>
        ids.includes(item.id)
          ? { ...item, isAvailable: availability }
          : item
      )
    );
    setSelectedIds([]);

    try {
      await bulkUpdateAvailability(ids, availability);
    } catch (err) {
      console.warn("Batch availability error:", err.message);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      price: "",
      isVeg: true,
      description: "",
      isAvailable: true,
      image: "",
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      isVeg: item.isVeg,
      description: item.description,
      isAvailable: item.isAvailable,
      image: item.image,
    });
    setIsDrawerOpen(true);
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const payload = {
      name: formData.name,
      price: parseFloat(formData.price) || 0,
      isVeg: formData.isVeg,
      diet: formData.isVeg ? "Vegetarian" : "Non-Vegetarian",
      category: formData.isVeg ? "Main Course (Veg)" : "Main Course (Non-Veg)",
      description: formData.description,
      isAvailable: formData.isAvailable,
      image:
        formData.image ||
        "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
    };

    setIsDrawerOpen(false);

    if (editingItem) {
      setMenuItems((prev) =>
        prev.map((it) => (it.id === editingItem.id ? { ...it, ...payload } : it))
      );
      try {
        await updateMenuItem(editingItem.id, payload);
      } catch (err) {
        console.warn("Update menu item error:", err.message);
      }
    } else {
      try {
        const res = await createMenuItem(payload);
        if (res && res.success && res.data) {
          const newItem = {
            id: res.data.id,
            ...payload,
          };
          setMenuItems((prev) => [newItem, ...prev]);
        } else {
          fetchMenuItems();
        }
      } catch (err) {
        console.warn("Create menu item error:", err.message);
        fetchMenuItems();
      }
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDiet =
      dietFilter === "ALL" ||
      (dietFilter === "VEG" && item.isVeg) ||
      (dietFilter === "NON_VEG" && !item.isVeg);

    return matchesSearch && matchesDiet;
  });

  return (
    <div className="space-y-6 pb-12 select-none relative font-poppins">
      <header
        data-aos="fade-down"
        data-aos-duration="500"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative"
      >
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-none ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Menu Management
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Manage your digital QR menu dishes, tabular pricing, and live availability
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} className="stroke-[2.5]" />
          <span>Add New Dish</span>
        </button>
      </header>

      <Cards items={metricCards} />

      {/* Control Bar: Diet Filters, View Switcher & Search Bar */}
      <div
        data-aos="fade-up"
        data-aos-delay="100"
        className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Diet Filter Tabs */}
          <div
            className={`p-1 rounded-xl flex items-center gap-1 border ${
              isDark
                ? "bg-white/[0.03] border-white/10"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <button
              type="button"
              onClick={() => setDietFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                dietFilter === "ALL"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 !text-white shadow-sm shadow-orange-500/20"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              All Dishes ({totalItems})
            </button>

            <button
              type="button"
              onClick={() => setDietFilter("VEG")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                dietFilter === "VEG"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : isDark
                  ? "text-emerald-400 hover:text-white hover:bg-emerald-500/10"
                  : "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
              }`}
            >
              <Leaf size={13} />
              <span>Pure Veg ({vegCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setDietFilter("NON_VEG")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                dietFilter === "NON_VEG"
                  ? "bg-rose-500 text-white shadow-sm"
                  : isDark
                  ? "text-rose-400 hover:text-white hover:bg-rose-500/10"
                  : "text-rose-600 hover:text-rose-800 hover:bg-rose-50"
              }`}
            >
              <Beef size={13} />
              <span>Non-Veg ({totalItems - vegCount})</span>
            </button>
          </div>

          {/* View Mode Toggle: Table View vs Grid Cards */}
          <div
            className={`p-1 rounded-xl flex items-center gap-1 border ${
              isDark
                ? "bg-white/[0.03] border-white/10"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                viewMode === "table"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 !text-white shadow-sm shadow-orange-500/20"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="Table View with Multi-Select"
            >
              <List size={14} />
              <span>Table View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                viewMode === "cards"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 !text-white shadow-sm shadow-orange-500/20"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="Dish Cards View"
            >
              <LayoutGrid size={14} />
              <span>Dish Cards</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] sm:w-72">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search dish name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3.5 py-2 rounded-xl text-xs font-medium border outline-none transition-all ${
              isDark
                ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60 shadow-sm"
            }`}
          />
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div
          data-aos="zoom-in"
          className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 border border-orange-500/30 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-orange-500/5 animate-fade-in"
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-extrabold text-orange-600 dark:text-orange-400">
              {selectedIds.length} dish{selectedIds.length > 1 ? "es" : ""} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
            >
              Clear selection
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleBatchAvailability(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 size={13} />
              <span>Mark Available</span>
            </button>

            <button
              type="button"
              onClick={() => handleBatchAvailability(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-500/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <AlertCircle size={13} />
              <span>Mark Sold Out</span>
            </button>

            {/* Bulk Delete Button */}
            <button
              type="button"
              onClick={() =>
                setDeleteConfirm({
                  ids: selectedIds,
                  count: selectedIds.length,
                })
              }
              className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/25 transition-all cursor-pointer active:scale-95"
            >
              <Trash2 size={13} />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 1: Modern Table View with Multi-Select and Row Actions */}
      {viewMode === "table" ? (
        <div
          data-aos="fade-up"
          data-aos-delay="150"
          className={`rounded-2xl border overflow-hidden shadow-xl ${
            isDark
              ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
              : "bg-white/80 backdrop-blur-2xl border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isDark
                      ? "bg-white/[0.02] border-white/10 text-slate-400"
                      : "bg-slate-50/80 border-slate-200 text-slate-500"
                  }`}
                >
                  <th className="py-3.5 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredItems.length > 0 &&
                        filteredItems.every((i) => selectedIds.includes(i.id))
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 cursor-pointer accent-orange-500"
                      title="Select all dishes"
                    />
                  </th>
                  <th className="py-3.5 px-4">Dish</th>
                  <th className="py-3.5 px-4">Diet</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Live Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06] text-xs">
                {filteredItems.map((dish) => {
                  const isSelected = selectedIds.includes(dish.id);
                  return (
                    <tr
                      key={dish.id}
                      className={`transition-colors ${
                        isSelected
                          ? isDark
                            ? "bg-orange-500/10"
                            : "bg-orange-50/80"
                          : isDark
                          ? "hover:bg-white/[0.02]"
                          : "hover:bg-slate-50/60"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(dish.id)}
                          className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 cursor-pointer accent-orange-500"
                        />
                      </td>

                      {/* Dish Thumbnail & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-white/10 shadow-xs"
                          />
                          <div className="min-w-0">
                            <span
                              className={`font-extrabold text-sm block truncate ${
                                isDark ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {dish.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {dish.category || "Main Course"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Diet Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            dish.isVeg
                              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              dish.isVeg ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          <span>{dish.isVeg ? "Pure Veg" : "Non-Veg"}</span>
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-black text-sm text-orange-500">
                          ₹{dish.price}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-400 truncate" title={dish.description}>
                          {dish.description}
                        </p>
                      </td>

                      {/* Live Availability Toggle */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(dish.id)}
                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                              dish.isAvailable
                                ? "bg-emerald-500"
                                : "bg-slate-300 dark:bg-white/20"
                            }`}
                            title={
                              dish.isAvailable
                                ? "Mark Out of Stock"
                                : "Mark Available"
                            }
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                dish.isAvailable
                                  ? "translate-x-5"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[11px] font-bold ${
                              dish.isAvailable
                                ? "text-emerald-500"
                                : "text-slate-400"
                            }`}
                          >
                            {dish.isAvailable ? "Available" : "Sold Out"}
                          </span>
                        </div>
                      </td>

                      {/* Row Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(dish)}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                              isDark
                                ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-orange-400"
                                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-orange-600"
                            }`}
                            title="Edit Dish"
                          >
                            <Edit2 size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                ids: [dish.id],
                                count: 1,
                                name: dish.name,
                              })
                            }
                            className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-all cursor-pointer"
                            title="Delete Dish"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW 2: Dish Cards Grid */
        <div
          data-aos="fade-up"
          data-aos-delay="150"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {filteredItems.map((dish) => {
            const isSelected = selectedIds.includes(dish.id);
            return (
              <div
                key={dish.id}
                className={`rounded-2xl border shadow-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 relative ${
                  isSelected ? "ring-2 ring-orange-500 shadow-orange-500/15" : ""
                } ${
                  isDark
                    ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
                    : "bg-white/70 backdrop-blur-2xl border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                }`}
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900/10">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Checkbox Overlay */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(dish.id)}
                        className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 cursor-pointer accent-orange-500 shadow-md"
                        title="Select dish"
                      />
                      <span
                        className={`w-6 h-6 rounded-lg bg-white/95 backdrop-blur-md flex items-center justify-center border shadow-md ${
                          dish.isVeg
                            ? "border-emerald-500 text-emerald-600"
                            : "border-rose-500 text-rose-600"
                        }`}
                        title={dish.isVeg ? "Vegetarian" : "Non-Vegetarian"}
                      >
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            dish.isVeg ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-md backdrop-blur-md ${
                          dish.isAvailable
                            ? "bg-emerald-500 text-white"
                            : "bg-rose-500 text-white"
                        }`}
                      >
                        {dish.isAvailable ? "Available" : "Sold Out"}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-xl text-white font-black text-sm">
                      ₹{dish.price}
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={`font-extrabold text-base tracking-tight leading-snug ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {dish.name}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {dish.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(dish.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        dish.isAvailable
                          ? "bg-emerald-500"
                          : "bg-slate-300 dark:bg-white/20"
                      }`}
                      title={
                        dish.isAvailable
                          ? "Mark Out of Stock"
                          : "Mark Available"
                      }
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          dish.isAvailable
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className="text-[11px] font-bold text-slate-400">
                      {dish.isAvailable ? "Live" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(dish)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isDark
                          ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-orange-400"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-orange-600"
                      }`}
                      title="Edit Dish"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setDeleteConfirm({
                          ids: [dish.id],
                          count: 1,
                          name: dish.name,
                        })
                      }
                      className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isDark
                          ? "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-400"
                          : "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600"
                      }`}
                      title="Delete Dish"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredItems.length === 0 && (
        <div
          className={`p-12 text-center rounded-2xl border ${
            isDark
              ? "bg-white/[0.02] border-white/10 text-slate-400"
              : "bg-white border-slate-200 text-slate-500"
          }`}
        >
          <UtensilsCrossed size={36} className="mx-auto text-slate-400 mb-2" />
          <h3 className="font-bold text-base">No dishes found</h3>
          <p className="text-xs mt-1">
            Try adjusting your search query or diet filter
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 animate-fade-in">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setDeleteConfirm(null)}
          />
          <div
            className={`relative z-10 max-w-md w-full rounded-2xl border p-6 shadow-2xl transition-all ${
              isDark
                ? "bg-[#0c1022] border-white/10 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-extrabold tracking-tight">
              Delete {deleteConfirm.count > 1 ? `${deleteConfirm.count} Dishes` : "Dish"}?
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {deleteConfirm.count > 1
                ? `Are you sure you want to permanently delete these ${deleteConfirm.count} selected menu dishes? They will be removed immediately from your QR menu.`
                : `Are you sure you want to permanently delete "${deleteConfirm.name || "this dish"}"? This action cannot be undone.`}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isDark
                    ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300"
                    : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/25 transition-all cursor-pointer active:scale-95"
              >
                Yes, Delete {deleteConfirm.count > 1 ? `(${deleteConfirm.count})` : ""}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer: Add / Edit Dish */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-fade-in">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div
            className={`relative w-full max-w-md h-full flex flex-col justify-between shadow-2xl z-50 p-6 overflow-y-auto ${
              isDark
                ? "bg-[#0c1022] border-l border-white/10 text-white"
                : "bg-white border-l border-slate-200 text-slate-900"
            }`}
          >
            <form onSubmit={handleSaveForm} className="space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight">
                      {editingItem ? "Edit Dish" : "Add New Dish"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configure dish specifications, pricing, and category
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-xs text-slate-400 mb-1.5">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paneer Butter Masala"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                      isDark
                        ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-xs text-slate-400 mb-1.5">
                    Price (INR ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 280"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                      isDark
                        ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-xs text-slate-400 mb-1.5">
                    Diet Classification
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isVeg: true })}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        formData.isVeg
                          ? "bg-emerald-500/15 border-emerald-500 text-emerald-500"
                          : isDark
                          ? "bg-white/[0.02] border-white/10 text-slate-400"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Vegetarian</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isVeg: false })}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        !formData.isVeg
                          ? "bg-rose-500/15 border-rose-500 text-rose-500"
                          : isDark
                          ? "bg-white/[0.02] border-white/10 text-slate-400"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span>Non-Vegetarian</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-xs text-slate-400 mb-1.5">
                    Upload Dish Image
                  </label>
                  <div
                    className={`p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all ${
                      isDark
                        ? "bg-white/[0.02] border-white/10 hover:border-orange-500/50"
                        : "bg-slate-50 border-slate-200 hover:border-orange-500/50"
                    }`}
                  >
                    {formData.image ? (
                      <div className="w-full flex flex-col items-center gap-2.5">
                        <div className="relative w-36 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm">
                          <img
                            src={formData.image}
                            alt="Dish Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor="dish-image-file"
                            className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] cursor-pointer shadow-sm transition-all"
                          >
                            Change Photo
                          </label>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, image: "" })}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 hover:text-rose-500 text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="dish-image-file"
                        className="w-full flex flex-col items-center cursor-pointer py-3"
                      >
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mb-2">
                          <UploadCloud size={20} />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          Click to upload dish photo
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          PNG, JPG, or WEBP (Max 5MB)
                        </span>
                      </label>
                    )}
                    <input
                      type="file"
                      id="dish-image-file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-xs text-slate-400 mb-1.5">
                    Description & Ingredients
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Describe flavor notes, spices, portions..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-all resize-none ${
                      isDark
                        ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/60"
                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60"
                    }`}
                  />
                </div>

                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isDark
                      ? "bg-white/[0.02] border-white/10"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">
                      Live Availability Status
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Show dish as available for QR ordering
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        isAvailable: !formData.isAvailable,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      formData.isAvailable
                        ? "bg-emerald-500"
                        : "bg-slate-300 dark:bg-white/20"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isAvailable ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className={`px-4 py-2.5 rounded-xl border font-bold text-xs cursor-pointer transition-all ${
                    isDark
                      ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Save size={15} />
                  <span>{editingItem ? "Update Dish" : "Save Dish"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
