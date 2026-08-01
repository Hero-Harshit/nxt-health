'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusCircle, Search, AlertTriangle, CheckCircle2, Trash2, Edit3,
  ShieldAlert, PackageCheck, PackageX, Pill, Bandage, Sparkles,
  Scissors, Droplet, Info, X, Calendar, Layers
} from 'lucide-react';

// --- TYPES ---
export type FirstAidCategory =
  | 'Medicines'
  | 'Bandages & Dressings'
  | 'Antiseptics & Liquids'
  | 'Tools & Instruments'
  | 'Ointments & Creams'
  | 'General';

export interface FirstAidItem {
  id: string;
  name: string;
  category: FirstAidCategory;
  quantity: number;
  unit: string;
  expiryDate: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
}

// --- DESIGN TOKENS ---
const NAVY = '#0B1E3D';
const RED_ALERT = '#EF4444';
const AMBER_WARN = '#F59E0B';
const GREEN_OK = '#10B981';

const CATEGORIES: FirstAidCategory[] = [
  'Medicines',
  'Bandages & Dressings',
  'Antiseptics & Liquids',
  'Ointments & Creams',
  'Tools & Instruments',
  'General',
];

const CATEGORY_ICONS: Record<FirstAidCategory, React.ComponentType<{ className?: string }>> = {
  'Medicines': Pill,
  'Bandages & Dressings': Bandage,
  'Antiseptics & Liquids': Droplet,
  'Ointments & Creams': Sparkles,
  'Tools & Instruments': Scissors,
  'General': Layers,
};

const INITIAL_ITEMS: FirstAidItem[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    category: 'Medicines',
    quantity: 10,
    unit: 'tablets',
    expiryDate: '2026-11-15',
    notes: 'For fever and body pain',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Betadine Antiseptic Solution',
    category: 'Antiseptics & Liquids',
    quantity: 1,
    unit: 'bottle (100ml)',
    expiryDate: '2026-08-10',
    notes: 'For cleaning open wounds',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Adhesive Bandages (Band-Aids)',
    category: 'Bandages & Dressings',
    quantity: 15,
    unit: 'strips',
    expiryDate: '2028-01-01',
    notes: 'Waterproof small size',
    createdAt: new Date().toISOString(),
  }
];

export default function FirstAidBoxPage() {
  const [items, setItems] = useState<FirstAidItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<FirstAidCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Expired' | 'Soon' | 'Valid'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FirstAidItem | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    category: FirstAidCategory;
    quantity: number;
    unit: string;
    expiryDate: string;
    notes: string;
  }>({
    name: '',
    category: 'Medicines',
    quantity: 1,
    unit: 'units',
    expiryDate: '',
    notes: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('vfa_items');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        setItems(INITIAL_ITEMS);
      }
    } else {
      setItems(INITIAL_ITEMS);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('vfa_items', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const getItemStatus = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'Expired', days: Math.abs(diffDays), color: RED_ALERT, bg: 'bg-red-50 text-red-700 border-red-200' };
    } else if (diffDays <= 30) {
      return { status: 'Expiring Soon', days: diffDays, color: AMBER_WARN, bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    } else {
      return { status: 'Valid', days: diffDays, color: GREEN_OK, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
  };

  const summary = useMemo(() => {
    let total = items.length;
    let expired = 0;
    let expiringSoon = 0;
    let valid = 0;

    items.forEach((item) => {
      const { status } = getItemStatus(item.expiryDate);
      if (status === 'Expired') expired++;
      else if (status === 'Expiring Soon') expiringSoon++;
      else valid++;
    });

    return { total, expired, expiringSoon, valid };
  }, [items]);

  const processedItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const { status } = getItemStatus(item.expiryDate);
        let matchesStatus = true;
        if (selectedStatus === 'Expired') matchesStatus = status === 'Expired';
        if (selectedStatus === 'Soon') matchesStatus = status === 'Expiring Soon';
        if (selectedStatus === 'Valid') matchesStatus = status === 'Valid';

        return matchesCategory && matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  }, [items, selectedCategory, searchQuery, selectedStatus]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Medicines',
      quantity: 1,
      unit: 'tablets',
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: FirstAidItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      expiryDate: item.expiryDate,
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.expiryDate) return;

    if (editingItem) {
      setItems((prev) =>
        prev.map((i) => (i.id === editingItem.id ? { ...i, ...formData } : i))
      );
    } else {
      const newItem: FirstAidItem = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setItems((prev) => [...prev, newItem]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  return (
    <main className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8 font-sans antialiased text-gray-900">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Breadcrumb Navigation */}
        <div className="text-sm text-gray-400 mb-4">
          Home <span className="mx-1.5">/</span> Utilities{' '}
          <span className="mx-1.5">/</span>
          <span className="text-gray-700 font-medium">Virtual First Aid Box</span>
        </div>

        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl text-white font-bold bg-red-600">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: NAVY }}>
                Virtual First Aid Box
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Track emergency kit supplies, monitor expiry dates, and prevent critical shortages.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white shadow-sm transition-all hover:bg-red-700 bg-red-600 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Supply</span>
          </button>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => setSelectedStatus('All')} 
            className={`cursor-pointer bg-white p-4 rounded-2xl border transition-all ${selectedStatus === 'All' ? 'ring-2 ring-blue-500 border-blue-200' : 'border-gray-100 shadow-sm hover:border-gray-200'}`}
          >
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Items</span>
              <PackageCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black" style={{ color: NAVY }}>{summary.total}</div>
            <p className="text-[11px] text-gray-400 mt-1">In your digital kit</p>
          </div>

          <div 
            onClick={() => setSelectedStatus('Expired')} 
            className={`cursor-pointer bg-white p-4 rounded-2xl border transition-all ${selectedStatus === 'Expired' ? 'ring-2 ring-red-500 border-red-200' : 'border-gray-100 shadow-sm hover:border-gray-200'}`}
          >
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">Expired</span>
              <PackageX className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-black text-red-600">{summary.expired}</div>
            <p className="text-[11px] text-red-500 font-medium mt-1">Action needed: Discard</p>
          </div>

          <div 
            onClick={() => setSelectedStatus('Soon')} 
            className={`cursor-pointer bg-white p-4 rounded-2xl border transition-all ${selectedStatus === 'Soon' ? 'ring-2 ring-amber-500 border-amber-200' : 'border-gray-100 shadow-sm hover:border-gray-200'}`}
          >
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Expires Soon</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-600">{summary.expiringSoon}</div>
            <p className="text-[11px] text-amber-600 font-medium mt-1">Within 30 days</p>
          </div>

          <div 
            onClick={() => setSelectedStatus('Valid')} 
            className={`cursor-pointer bg-white p-4 rounded-2xl border transition-all ${selectedStatus === 'Valid' ? 'ring-2 ring-emerald-500 border-emerald-200' : 'border-gray-100 shadow-sm hover:border-gray-200'}`}
          >
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Ready & Valid</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600">{summary.valid}</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Emergency ready</p>
          </div>
        </div>

        {/* LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* SIDEBAR */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Categories
              </h2>

              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedCategory === 'All' ? 'bg-red-50 text-red-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="bg-gray-200/60 px-2 py-0.5 rounded-full text-[10px] text-gray-700">
                    {items.length}
                  </span>
                </button>

                {CATEGORIES.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat];
                  const count = items.filter((i) => i.category === cat).length;
                  const isSelected = selectedCategory === cat;

                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected ? 'bg-red-50 text-red-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-500" />
                        <span>{cat}</span>
                      </div>
                      <span className="bg-gray-200/60 px-2 py-0.5 rounded-full text-[10px] text-gray-700">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
                <Info className="w-4 h-4 shrink-0" />
                <span>Smart Sorting</span>
              </div>
              <p className="text-[11px] text-blue-700/80 leading-relaxed">
                Items closest to expiration are automatically displayed first.
              </p>
            </div>
          </div>

          {/* MAIN LIST */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search item or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {selectedStatus !== 'All' && (
                <button
                  onClick={() => setSelectedStatus('All')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
                >
                  Clear Status Filter ({selectedStatus})
                </button>
              )}
            </div>

            <div className="space-y-3">
              {processedItems.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm space-y-2">
                  <PackageX className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="text-sm font-bold text-gray-700">No supplies found</p>
                  <p className="text-xs text-gray-400">Try adjusting your filters or add a new supply.</p>
                </div>
              ) : (
                processedItems.map((item) => {
                  const Icon = CATEGORY_ICONS[item.category] || Layers;
                  const { status, days, bg } = getItemStatus(item.expiryDate);

                  return (
                    <div
                      key={item.id}
                      className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-gray-200 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-2xl bg-gray-50 text-gray-700 shrink-0">
                          <Icon className="w-6 h-6" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold" style={{ color: NAVY }}>
                              {item.name}
                            </h3>
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${bg}`}>
                              {status === 'Expired' && `EXPIRED (${days} days ago)`}
                              {status === 'Expiring Soon' && `EXPIRES IN ${days} DAYS`}
                              {status === 'Valid' && `Valid (${days} days remaining)`}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                            <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                              Qty: {item.quantity} {item.unit}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              Expires: {item.expiryDate}
                            </span>
                          </div>

                          {item.notes && (
                            <p className="text-xs text-gray-500 italic pt-1">
                              "{item.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Item"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold" style={{ color: NAVY }}>
                {editingItem ? 'Edit Supply' : 'Add First Aid Supply'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs font-medium">
              <div className="space-y-1">
                <label className="text-gray-600">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol / Dettol / Bandage"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-600">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as FirstAidCategory })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-600">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-600">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-600">Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. strips, bottle"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-600">Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Dosage instructions, location..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
