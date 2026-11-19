import { useState, useEffect } from "react";
import {
  Users as UsersIcon,
  Search,
  Eye,
  CheckCircle2,
  Trash2,
  X,
  Phone,
  ShieldCheck,
  Calendar,
  Store,
  UserCheck,
  RotateCw,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import Cards from "../../../components/Cards";
import Pagination from "../../../components/Pagination";
import {
  getAllRestaurants,
  updateRestaurant,
  deleteRestaurant as apiDeleteRestaurant,
  bulkDeleteRestaurants,
} from "../../../services/restroServices";

export default function Users() {
  const { isDark } = useTheme();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Drawer State
  const [drawerUser, setDrawerUser] = useState(null);

  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  // Users list state (Populated directly from restaurants table in DB)
  const [users, setUsers] = useState([]);

  const fetchUsersFromRestaurants = async () => {
    try {
      setIsLoading(true);
      const res = await getAllRestaurants();
      if (res && res.success && Array.isArray(res.data)) {
        const mappedUsers = res.data.map((r, idx) => {
          const ownerName = r.owner && r.owner.trim() ? r.owner.trim() : r.name;
          const initial = (ownerName || "U")[0].toUpperCase();
          const avatarColors = [
            "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30",
            "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
            "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
            "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
          ];
          const avatarBg = avatarColors[idx % avatarColors.length];

          return {
            id: r.id,
            name: ownerName,
            initial,
            avatarBg,
            email: r.email || "N/A",
            phone: r.phone || "N/A",
            role: "OWNER",
            roleColor:
              "bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-300",
            restaurant: r.name,
            status: r.status || "Active",
            joined: r.createdAt
              ? new Date(r.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                })
              : "Nov 2026",
          };
        });

        setUsers(mappedUsers);
      }
    } catch (err) {
      console.warn("Could not fetch users from restaurants table:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersFromRestaurants();
  }, []);

  // Metric stats calculated dynamically from database
  const metricCards = [
    {
      title: "Total Accounts",
      value: users.length.toString(),
      icon: UsersIcon,
      iconColor: "text-blue-500 dark:text-blue-400",
      iconBg: "bg-blue-500/10 border-blue-500/20",
      glowColor: "from-blue-500/20 via-blue-500/5 to-transparent",
      accentBorder: "hover:border-blue-500/40",
    },
    {
      title: "Restaurant Owners",
      value: users.filter((u) => u.role === "OWNER").length.toString(),
      icon: Store,
      iconColor: "text-purple-500 dark:text-purple-400",
      iconBg: "bg-purple-500/10 border-purple-500/20",
      glowColor: "from-purple-500/20 via-purple-500/5 to-transparent",
      accentBorder: "hover:border-purple-500/40",
    },
    {
      title: "Registered Diners",
      value: users.filter((u) => u.role === "DINER").length.toString(),
      icon: UserCheck,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      glowColor: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      accentBorder: "hover:border-emerald-500/40",
    },
    {
      title: "Active Users",
      value: users.filter((u) => u.status === "Active").length.toString(),
      icon: CheckCircle2,
      iconColor: "text-cyan-500 dark:text-cyan-400",
      iconBg: "bg-cyan-500/10 border-cyan-500/20",
      glowColor: "from-cyan-500/20 via-cyan-500/5 to-transparent",
      accentBorder: "hover:border-cyan-500/40",
    },
  ];

  // Filter users by query, role, status
  const filteredUsers = users.filter((user) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (user.name && user.name.toLowerCase().includes(q)) ||
      (user.email && user.email.toLowerCase().includes(q)) ||
      (user.phone && user.phone.toLowerCase().includes(q)) ||
      (user.restaurant && user.restaurant.toLowerCase().includes(q));

    const matchesRole =
      selectedRole === "ALL" || user.role.toUpperCase() === selectedRole;

    const matchesStatus =
      selectedStatus === "ALL" || user.status.toUpperCase() === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRole, selectedStatus]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Master Select All / Deselect All
  const isAllSelected =
    filteredUsers.length > 0 &&
    filteredUsers.every((u) => selectedIds.includes(u.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      const filteredIds = new Set(filteredUsers.map((u) => u.id));
      setSelectedIds(selectedIds.filter((id) => !filteredIds.has(id)));
    } else {
      const combined = new Set([
        ...selectedIds,
        ...filteredUsers.map((u) => u.id),
      ]);
      setSelectedIds(Array.from(combined));
    }
  };

  // Toggle Single Row Selection
  const handleToggleRow = (id, e) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Bulk Delete Selected directly in MySQL
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await bulkDeleteRestaurants(selectedIds);
      setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
      if (drawerUser && selectedIds.includes(drawerUser.id)) {
        setDrawerUser(null);
      }
      setSelectedIds([]);
      fetchUsersFromRestaurants();
    } catch (err) {
      console.error("Bulk delete error:", err);
    }
  };

  // Single Delete in MySQL
  const deleteUser = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await apiDeleteRestaurant(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      if (drawerUser && drawerUser.id === id) {
        setDrawerUser(null);
      }
      fetchUsersFromRestaurants();
    } catch (err) {
      console.error("Delete user error:", err);
    }
  };

  // Toggle user active status directly in MySQL
  const toggleStatus = async (id, e) => {
    if (e) e.stopPropagation();
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const newStatus = target.status === "Active" ? "Inactive" : "Active";
    try {
      await updateRestaurant(id, { status: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
      );
      if (drawerUser && drawerUser.id === id) {
        setDrawerUser((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      fetchUsersFromRestaurants();
    } catch (err) {
      console.error("Status toggle error:", err);
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none relative font-poppins">
      {/* 1. Header: Matches Restaurants & Dashboard theme */}
      <header
        data-aos="fade-down"
        data-aos-duration="500"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative"
      >
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-none ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Users Management
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real-time Database Live
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1.5">
            Manage platform accounts, restaurant managers, dining guests, and roles
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={fetchUsersFromRestaurants}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-500/20 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 text-xs font-bold transition-all cursor-pointer"
          >
            <RotateCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* 2. Top Metric Cards (Rendered using Cards Component) */}
      <Cards items={metricCards} />

      {/* 3. Main Users Directory (Glassy Container) */}
      <div
        data-aos="fade-up"
        data-aos-delay="100"
        className={`p-6 rounded-2xl border shadow-xl flex flex-col space-y-5 ${
          isDark
            ? "bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]"
            : "bg-white/60 backdrop-blur-2xl border-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
        }`}
      >
        {/* Top Controls: Title, Count Badge, Bulk Delete Button, Search Input, and Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2
              className={`text-base sm:text-lg font-bold tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Registered Users
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-[10px] font-extrabold tracking-wider">
              {filteredUsers.length} Users
            </span>

            {/* Bulk Delete Action Button */}
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-all duration-200 cursor-pointer shadow-sm animate-fade-in"
                title="Delete all selected users"
              >
                <Trash2 size={13} className="stroke-[2.2]" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )}
          </div>

          {/* Search Bar & Filter Pills */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative min-w-[220px] flex-1 sm:flex-initial">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search user, email, phone, venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border transition-all outline-none ${
                  isDark
                    ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-orange-500/50 focus:bg-white/[0.07]"
                    : "bg-white/70 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-orange-500/60 focus:bg-white shadow-sm"
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer text-xs"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Role Filter Pills */}
            <div
              className={`flex items-center p-1 rounded-xl border text-[11px] font-semibold gap-1 ${
                isDark ? "bg-white/[0.02] border-white/10" : "bg-slate-100/80 border-slate-200"
              }`}
            >
              <span className="text-slate-400 text-[10px] uppercase font-bold px-1.5 hidden sm:inline">
                Role:
              </span>
              {["ALL", "OWNER", "STAFF", "DINER"].map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                    selectedRole === role
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-xs"
                      : isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Status Filter Pills */}
            <div
              className={`flex items-center p-1 rounded-xl border text-[11px] font-semibold gap-1 ${
                isDark ? "bg-white/[0.02] border-white/10" : "bg-slate-100/80 border-slate-200"
              }`}
            >
              <span className="text-slate-400 text-[10px] uppercase font-bold px-1.5 hidden sm:inline">
                Status:
              </span>
              {["ALL", "ACTIVE", "INACTIVE"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                    selectedStatus === status
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-xs"
                      : isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Responsive Table */}
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className={`border-b text-[10px] font-extrabold uppercase tracking-wider ${
                  isDark
                    ? "border-white/10 text-slate-400"
                    : "border-slate-200 text-slate-400"
                }`}
              >
                {/* Master Bulk Select Checkbox */}
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 dark:border-white/20 text-orange-500 accent-orange-500 focus:ring-orange-500 cursor-pointer"
                    title="Select All / Deselect All"
                  />
                </th>
                <th className="py-3 px-3">USER</th>
                <th className="py-3 px-3">EMAIL</th>
                <th className="py-3 px-3">PHONE</th>
                <th className="py-3 px-3">ROLE</th>
                <th className="py-3 px-3">ASSIGNED VENUE</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3">JOINED</th>
                <th className="py-3 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y text-xs ${
                isDark ? "divide-white/[0.04]" : "divide-slate-100"
              }`}
            >
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <RotateCw className="mx-auto mb-2 animate-spin text-orange-500" size={24} />
                    <p className="font-semibold text-sm">Loading users from database...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <UsersIcon className="mx-auto mb-2 opacity-40" size={32} />
                    <p className="font-semibold text-sm">No users found in database</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Try adjusting your search query or filter selection
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const isSelected = selectedIds.includes(user.id);
                  return (
                    <tr
                      key={user.id}
                      onClick={() => setDrawerUser(user)}
                      className={`transition-colors group cursor-pointer ${
                        isSelected
                          ? isDark
                            ? "bg-orange-500/10 hover:bg-orange-500/15"
                            : "bg-orange-50/70 hover:bg-orange-50"
                          : isDark
                          ? "hover:bg-white/[0.025]"
                          : "hover:bg-slate-50/80"
                      }`}
                    >
                      {/* Row Checkbox */}
                      <td
                        className="py-3.5 px-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleRow(user.id, e)}
                          className="w-4 h-4 rounded border-slate-300 dark:border-white/20 text-orange-500 accent-orange-500 focus:ring-orange-500 cursor-pointer"
                        />
                      </td>

                      {/* User Avatar & Name */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg border ${user.avatarBg} font-extrabold text-[11px] flex items-center justify-center shrink-0 shadow-xs`}
                          >
                            {user.initial}
                          </div>
                          <span
                            className={`font-semibold truncate max-w-[130px] transition-colors group-hover:text-orange-500 ${
                              isDark ? "text-white" : "text-slate-800"
                            }`}
                          >
                            {user.name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td
                        className={`py-3.5 px-3 truncate max-w-[150px] ${
                          isDark ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        {user.email}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400 truncate max-w-[120px]">
                        {user.phone}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide border ${user.roleColor}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Assigned Venue */}
                      <td
                        className={`py-3.5 px-3 font-medium truncate max-w-[120px] ${
                          isDark ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        {user.restaurant}
                      </td>

                      {/* Status Toggle Switch */}
                      <td
                        className="py-3.5 px-3 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => toggleStatus(user.id, e)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              user.status === "Active"
                                ? "bg-emerald-500 shadow-sm shadow-emerald-500/30"
                                : isDark
                                ? "bg-slate-700"
                                : "bg-slate-300"
                            }`}
                            role="switch"
                            aria-checked={user.status === "Active"}
                            title={`Click to switch to ${user.status === "Active" ? "Inactive" : "Active"}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                user.status === "Active" ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[11px] font-bold ${
                              user.status === "Active"
                                ? "text-emerald-500"
                                : "text-slate-400"
                            }`}
                          >
                            {user.status}
                          </span>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-3 text-slate-400 text-xs">
                        {user.joined}
                      </td>

                      {/* Actions: Eye Icon (Opens Drawer) & Delete Icon */}
                      <td
                        className="py-3.5 px-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDrawerUser(user)}
                            className={`p-2 rounded-lg border transition-all cursor-pointer ${
                              isDark
                                ? "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:scale-105"
                                : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:scale-105"
                            }`}
                            title="View User Details"
                          >
                            <Eye size={14} className="stroke-[2.2]" />
                          </button>

                          <button
                            onClick={(e) => deleteUser(user.id, e)}
                            className={`p-2 rounded-lg border transition-all cursor-pointer ${
                              isDark
                                ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:scale-105"
                                : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 hover:scale-105"
                            }`}
                            title="Remove User / Venue from DB"
                          >
                            <Trash2 size={14} className="stroke-[2.2]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* 5. Detailed Slide-Over Drawer */}
      {drawerUser && (
        <div className="fixed inset-0 z-50 overflow-hidden font-poppins">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerUser(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div
              className={`w-screen max-w-md border-l shadow-2xl flex flex-col justify-between ${
                isDark
                  ? "bg-[#0b0f1d] border-white/10 text-white"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-lg tracking-tight">
                    User Account Details
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live database record overview
                  </p>
                </div>
                <button
                  onClick={() => setDrawerUser(null)}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    isDark
                      ? "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                      : "border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body (Scrollable) */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Profile Card */}
                <div
                  className={`p-5 rounded-2xl border flex items-center gap-4 ${
                    isDark
                      ? "bg-white/[0.03] border-white/10"
                      : "bg-slate-50 border-slate-200/80 shadow-sm"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl border ${drawerUser.avatarBg} font-extrabold text-lg flex items-center justify-center shrink-0 shadow-sm`}
                  >
                    {drawerUser.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold truncate">
                        {drawerUser.name}
                      </h4>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${drawerUser.roleColor}`}
                      >
                        {drawerUser.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {drawerUser.email}
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Account Information
                  </h5>

                  <div className="grid grid-cols-1 gap-2.5 text-xs">
                    {/* Assigned Venue */}
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isDark
                          ? "bg-white/[0.02] border-white/5"
                          : "bg-white border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-slate-400">
                        <Store size={15} />
                        <span className="font-semibold">Assigned Restaurant</span>
                      </div>
                      <span className="font-bold">{drawerUser.restaurant}</span>
                    </div>

                    {/* Contact Phone */}
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isDark
                          ? "bg-white/[0.02] border-white/5"
                          : "bg-white border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-slate-400">
                        <Phone size={15} />
                        <span className="font-semibold">Contact Phone</span>
                      </div>
                      <span className="font-mono font-bold">{drawerUser.phone}</span>
                    </div>

                    {/* Account Status */}
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isDark
                          ? "bg-white/[0.02] border-white/5"
                          : "bg-white border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-slate-400">
                        <ShieldCheck size={15} />
                        <span className="font-semibold">Account Status</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => toggleStatus(drawerUser.id, e)}
                          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            drawerUser.status === "Active"
                              ? "bg-emerald-500 shadow-sm shadow-emerald-500/30"
                              : isDark
                              ? "bg-slate-700"
                              : "bg-slate-300"
                          }`}
                          role="switch"
                          aria-checked={drawerUser.status === "Active"}
                          title={`Click to turn ${drawerUser.status === "Active" ? "Inactive" : "Active"}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              drawerUser.status === "Active" ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span
                          className={`text-[11px] font-bold ${
                            drawerUser.status === "Active"
                              ? "text-emerald-500"
                              : "text-slate-400"
                          }`}
                        >
                          {drawerUser.status}
                        </span>
                      </div>
                    </div>

                    {/* Joined Date */}
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isDark
                          ? "bg-white/[0.02] border-white/5"
                          : "bg-white border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-slate-400">
                        <Calendar size={15} />
                        <span className="font-semibold">Onboarded Since</span>
                      </div>
                      <span className="font-bold">{drawerUser.joined}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
                <button
                  onClick={(e) => toggleStatus(drawerUser.id, e)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                    drawerUser.status === "Active"
                      ? "border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                      : "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                  }`}
                >
                  {drawerUser.status === "Active" ? "Deactivate Account" : "Activate Account"}
                </button>
                <button
                  onClick={(e) => deleteUser(drawerUser.id, e)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-rose-500 hover:bg-rose-500/10 border border-rose-500/25 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
