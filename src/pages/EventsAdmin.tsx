import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar, Clock, MapPin, Sparkles, Layout, Check, X, Image as ImageIcon, Eye, Monitor, Smartphone } from "lucide-react";
import axiosInstance, { api } from "../services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Calendar as CalendarComponent } from "../components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const EventsAdmin = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("template1");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [originalDates, setOriginalDates] = useState({ startDate: "", endDate: "" });
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(10);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    badge: "Special Offer",
    ctaLabel: "Shop Now",
    ctaLink: "/shop",
    accentColor: "#D4A373",
    darkColor: "#2C1810",
    bgColor: "#EBE3D5",
    heroImage: "",
    startDate: "",
    endDate: "",
    time: "",
    location: "",
    isActive: false,
    template: "template1",
    highlights: [] as any[],
    offers: [] as any[],
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await api.events.getAll();
      setEvents(data);
    } catch (err) {
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await api.products.getAll();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setOriginalDates({ startDate: "", endDate: "" });
    setFormData({
      title: "",
      subtitle: "",
      badge: "Special Offer",
      ctaLabel: "Shop Now",
      ctaLink: "/shop",
      accentColor: "#D4A373",
      darkColor: "#2C1810",
      bgColor: "#EBE3D5",
      heroImage: "",
      startDate: "",
      endDate: "",
      time: "",
      location: "",
      isActive: false,
      template: "template1",
      highlights: [],
      offers: [],
    });
    setShowTemplateModal(true);
  };

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      template: template,
      accentColor: template === "template2" ? "#D2B48C" : "#D4A373",
      darkColor: template === "template2" ? "#FFFFFF" : "#2C1810",
      bgColor: template === "template2" ? "#3E2723" : "#EBE3D5",
    }));
    setShowTemplateModal(false);
    setShowFormModal(true);
  };

  const handleEdit = (event: any) => {
    setEditingId(event._id);
    setOriginalDates({ startDate: event.startDate || "", endDate: event.endDate || "" });
    setFormData({
      title: event.title || "",
      subtitle: event.subtitle || "",
      badge: event.badge || "Special Offer",
      ctaLabel: event.ctaLabel || "Shop Now",
      ctaLink: event.ctaLink || "/shop",
      accentColor: event.accentColor || "#D4A373",
      darkColor: event.darkColor || "#2C1810",
      bgColor: event.bgColor || "#EBE3D5",
      heroImage: event.heroImage || "",
      startDate: event.startDate || "",
      endDate: event.endDate || "",
      time: event.time || "",
      location: event.location || "",
      isActive: event.isActive || false,
      template: event.template || "template1",
      highlights: event.highlights || [],
      offers: event.offers || [],
    });
    setSelectedTemplate(event.template || "template1");
    setShowFormModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await axiosInstance.delete(`/events/${id}`);
      toast.success("Event deleted");
      fetchEvents();
    } catch (err) {
      toast.error("Failed to delete event");
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await api.events.toggleActive(id);
      toast.success("Active status updated");
      fetchEvents();
    } catch (err) {
      toast.error("Failed to toggle status");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && (formData.startDate !== originalDates.startDate || formData.endDate !== originalDates.endDate)) {
      setShowSavePrompt(true);
      return;
    }
    await confirmSave(false);
  };

  const confirmSave = async (asNew: boolean) => {
    try {
      if (asNew) {
        await api.events.create(formData);
        toast.success("Event created as new");
      } else if (editingId) {
        await api.events.update(editingId, formData);
        toast.success("Event updated");
      } else {
        await api.events.create(formData);
        toast.success("Event created");
      }
      setShowSavePrompt(false);
      setShowFormModal(false);
      fetchEvents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save event");
    }
  };

  const handleAddProductOffer = (product: any) => {
    const discountedPrice = (product.price * (1 - discountPercent / 100)).toFixed(2);
    const newOffer = {
      productId: product._id,
      name: product.name,
      price: `$${discountedPrice}`,
      originalPrice: `$${product.price.toFixed(2)}`,
      discount: `${discountPercent}% OFF`,
      image: product.img,
      badge: `${discountPercent}% OFF`,
      emoji: ""
    };

    setFormData({
      ...formData,
      offers: [...formData.offers, newOffer]
    });
    setShowProductModal(false);
    toast.success(`${product.name} added with ${discountPercent}% discount`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-chocolate flex items-center gap-3">
            <Sparkles className="text-strawberry animate-pulse" />
            Event Management
          </h1>
          <p className="text-chocolate/60 mt-1">Create and manage your bakery's special events and sales.</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-chocolate hover:bg-strawberry rounded-full px-6">
          <Plus className="mr-2 h-4 w-4" /> New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event: any) => (
          <div key={event._id} className={`group relative bg-white rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-2xl ${event.isActive ? 'border-strawberry shadow-lg' : 'border-chocolate/10 shadow-sm'}`}>
            <div className="aspect-[16/9] relative overflow-hidden bg-cream/20">
              {event.heroImage ? (
                <img src={event.heroImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-chocolate/20">
                  <ImageIcon size={48} />
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-widest text-chocolate shadow-sm border border-chocolate/5">
                  {event.template === 'template1' ? 'Modern' : 'Cinematic'}
                </span>
                {event.isActive && (
                  <span className="px-3 py-1 bg-strawberry text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                    Active
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-chocolate line-clamp-1">{event.title}</h3>
                <p className="text-xs text-chocolate/50 line-clamp-2 mt-1">{event.subtitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider text-chocolate/40">
                <div className="flex items-center gap-1.5 bg-cream/30 p-2 rounded-xl border border-chocolate/5">
                  <Calendar size={12} className="text-strawberry" />
                  <span>{event.startDate || 'No date'}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-cream/30 p-2 rounded-xl border border-chocolate/5">
                  <MapPin size={12} className="text-strawberry" />
                  <span className="truncate">{event.location || 'Anywhere'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-chocolate/5">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(event)} className="h-8 w-8 hover:bg-cream/50">
                    <Edit size={14} className="text-chocolate" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(event._id)} className="h-8 w-8 hover:text-strawberry hover:bg-strawberry/10">
                    <Trash2 size={14} />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-[10px] uppercase tracking-widest opacity-50">Active</Label>
                  <Switch
                    checked={event.isActive}
                    onCheckedChange={() => handleToggleActive(event._id)}
                    className="data-[state=checked]:bg-strawberry shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && !loading && (
          <div className="col-span-full py-20 bg-cream/20 rounded-[3rem] border-2 border-dashed border-chocolate/10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-6 bg-white rounded-full shadow-inner border border-chocolate/5">
              <Layout size={40} className="text-chocolate/20" />
            </div>
            <div>
              <p className="text-lg font-bold text-chocolate">No events yet</p>
              <p className="text-sm text-chocolate/40">Launch your first celebration to wow your customers.</p>
            </div>
            <Button onClick={handleOpenAdd} variant="outline" className="rounded-full border-chocolate/20 text-chocolate hover:bg-chocolate hover:text-white transition-all">
              Let's Begin
            </Button>
          </div>
        )}
      </div>

      {/* --- Template Selection Modal --- */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-xl rounded-[2.5rem] border-none shadow-2xl p-8">
          <DialogHeader className="text-center">
            <DialogTitle className="text-3xl font-black text-chocolate font-playfair">Select Your Vibe</DialogTitle>
            <DialogDescription className="text-chocolate/60 font-medium">
              Choose a design template for your event. Hover to preview the style.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-8 py-8">
            <button
              onClick={() => handleTemplateSelect('template1')}
              className="group relative h-72 rounded-[2rem] overflow-hidden border-2 border-chocolate/5 transition-all hover:border-strawberry hover:shadow-2xl hover:-translate-y-2 ring-strawberry/20 focus:ring-4 outline-none"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#EBE3D5] to-[#D4A373]/20 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <Monitor size={32} className="text-[#D4A373]" />
                </div>
                <h4 className="text-lg font-black text-chocolate uppercase tracking-widest">Template 1</h4>
                <p className="text-[10px] font-bold text-chocolate/40 mt-2 leading-relaxed">
                  Light, Modern & Clean.<br />Perfect for Festivals & Day Sales.
                </p>
                <div className="mt-6 px-4 py-2 bg-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">Choose Aesthetic</div>
              </div>
              <div className="absolute top-4 right-4 text-strawberry opacity-0 group-hover:opacity-100 transition-opacity">
                <Check size={20} strokeWidth={3} />
              </div>
            </button>

            <button
              onClick={() => handleTemplateSelect('template2')}
              className="group relative h-72 rounded-[2rem] overflow-hidden border-2 border-chocolate/5 transition-all hover:border-[#D2B48C] hover:shadow-2xl hover:-translate-y-2 ring-[#D2B48C]/20 focus:ring-4 outline-none"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#3E2723] to-[#2C1810] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform border border-white/10">
                  <Smartphone size={32} className="text-[#D2B48C]" />
                </div>
                <h4 className="text-lg font-black text-white uppercase tracking-widest">Template 2</h4>
                <p className="text-[10px] font-bold text-white/40 mt-2 leading-relaxed">
                  Dark, Cinematic & Premium.<br />Best for Luxury Offers & Seasonal Vibes.
                </p>
                <div className="mt-6 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-sm">Choose Aesthetic</div>
              </div>
              <div className="absolute top-4 right-4 text-[#D2B48C] opacity-0 group-hover:opacity-100 transition-opacity">
                <Check size={20} strokeWidth={3} />
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Event Form Modal --- */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="sm:max-w-4xl bg-white rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col">
          <div className={`p-8 ${selectedTemplate === 'template1' ? 'bg-[#EBE3D5]/20' : 'bg-[#3E2723] text-white'}`}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-2xl font-black uppercase tracking-tighter">
                  {editingId ? 'Edit Event' : 'Create New Celebration'}
                </h4>
                <p className={`text-[10px] font-bold uppercase tracking-[0.3em] opacity-50 mt-1`}>
                  Using {selectedTemplate === 'template1' ? 'Modern Vibe' : 'Cinematic Vibe'}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowFormModal(false)} className="rounded-full hover:bg-black/5">
                <X size={20} />
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-0 space-y-0 scrollbar-hide flex flex-col">
            <Tabs defaultValue="hero" className="flex-1 flex flex-col">
              <div className="px-8 border-b bg-cream/5">
                <TabsList className="bg-transparent border-none gap-8 h-14">
                  <TabsTrigger value="hero" className="data-[state=active]:bg-transparent data-[state=active]:text-strawberry data-[state=active]:border-b-2 data-[state=active]:border-strawberry rounded-none px-0 text-xs font-black uppercase tracking-widest border-b-2 border-transparent transition-all">Hero & Style</TabsTrigger>
                  <TabsTrigger value="content" className="data-[state=active]:bg-transparent data-[state=active]:text-strawberry data-[state=active]:border-b-2 data-[state=active]:border-strawberry rounded-none px-0 text-xs font-black uppercase tracking-widest border-b-2 border-transparent transition-all">Highlights & Offers</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <TabsContent value="hero" className="m-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                      <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-strawberry">Hero Details</h5>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest opacity-60">Event Title</Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Summer Delight Sale"
                            className="rounded-2xl border-chocolate/10 bg-cream/5 focus:ring-strawberry/20"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="subtitle" className="text-xs font-bold uppercase tracking-widest opacity-60">Short Tagline</Label>
                          <Textarea
                            id="subtitle"
                            value={formData.subtitle}
                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                            placeholder="Brief catchy description..."
                            className="rounded-2xl border-chocolate/10 bg-cream/5 h-20"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="badge" className="text-xs font-bold uppercase tracking-widest opacity-60">Badge Text</Label>
                            <Input id="badge" value={formData.badge} onChange={(e) => setFormData({ ...formData, badge: e.target.value })} className="rounded-xl border-chocolate/10 border" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="heroImage" className="text-xs font-bold uppercase tracking-widest opacity-60">Hero Image URL</Label>
                            <Input id="heroImage" value={formData.heroImage} onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })} placeholder="https://..." className="rounded-xl border-chocolate/10 border" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Venue & Time */}
                    <div className="space-y-6">
                      <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-strawberry">Logistics</h5>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5 flex flex-col">
                            <Label htmlFor="startDate" className="text-xs font-bold uppercase tracking-widest opacity-60">Start Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full justify-start text-left font-normal rounded-xl border-chocolate/10 bg-cream/5",
                                    !formData.startDate && "text-muted-foreground"
                                  )}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {formData.startDate ? formData.startDate : <span>Pick a date</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={formData.startDate ? new Date(formData.startDate) : undefined}
                                  onSelect={(date) => setFormData({ ...formData, startDate: date ? format(date, "MMM dd, yyyy") : "" })}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="space-y-1.5 flex flex-col">
                            <Label htmlFor="endDate" className="text-xs font-bold uppercase tracking-widest opacity-60">End Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full justify-start text-left font-normal rounded-xl border-chocolate/10 bg-cream/5",
                                    !formData.endDate && "text-muted-foreground"
                                  )}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {formData.endDate ? formData.endDate : <span>Pick a date</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={formData.endDate ? new Date(formData.endDate) : undefined}
                                  onSelect={(date) => setFormData({ ...formData, endDate: date ? format(date, "MMM dd, yyyy") : "" })}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="time" className="text-xs font-bold uppercase tracking-widest opacity-60">Time/Location</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <Input id="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} placeholder="9 AM - 9 PM" className="rounded-xl border-chocolate/10 border" />
                            <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Online & Stores" className="rounded-xl border-chocolate/10 border" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="m-0 space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Highlights */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-strawberry">High-Value Highlights</h5>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-full text-[9px] font-bold uppercase tracking-widest h-7 border-strawberry/20 text-strawberry hover:bg-strawberry/5"
                        onClick={() => setFormData({ ...formData, highlights: [...formData.highlights, { icon: 'Star', title: '', desc: '' }] })}
                      >
                        <Plus size={10} className="mr-1" /> Add Highlight
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {formData.highlights.map((h, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-cream/10 border border-chocolate/5 space-y-3 relative group">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setFormData({ ...formData, highlights: formData.highlights.filter((_, idx) => idx !== i) })}
                          >
                            <X size={10} />
                          </Button>
                          <div className="flex gap-3">
                            <div className="w-1/3 space-y-1.5">
                              <Label className="text-[9px] uppercase tracking-widest opacity-50">Icon</Label>
                              <Input value={h.icon} onChange={(e) => {
                                const newH = [...formData.highlights];
                                newH[i].icon = e.target.value;
                                setFormData({ ...formData, highlights: newH });
                              }} className="h-8 text-[10px] rounded-lg" placeholder="Star, Gift..." />
                            </div>
                            <div className="flex-1 space-y-1.5">
                              <Label className="text-[9px] uppercase tracking-widest opacity-50">Title</Label>
                              <Input value={h.title} onChange={(e) => {
                                const newH = [...formData.highlights];
                                newH[i].title = e.target.value;
                                setFormData({ ...formData, highlights: newH });
                              }} className="h-8 text-[10px] rounded-lg" placeholder="Free Delivery" />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[9px] uppercase tracking-widest opacity-50">Description</Label>
                            <Input value={h.desc} onChange={(e) => {
                              const newH = [...formData.highlights];
                              newH[i].desc = e.target.value;
                              setFormData({ ...formData, highlights: newH });
                            }} className="h-8 text-[10px] rounded-lg" placeholder="On orders above ₹500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Offers */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-strawberry">Featured Offers</h5>
                        <p className="text-[9px] text-chocolate/40 mt-1">Select products and apply discounts automatically.</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-cream/30 px-3 py-1 rounded-full border border-strawberry/10">
                          <Label className="text-[9px] font-black uppercase tracking-widest text-strawberry">Discount %</Label>
                          <Input
                            type="number"
                            value={discountPercent}
                            onChange={(e) => setDiscountPercent(parseInt(e.target.value))}
                            className="w-12 h-6 text-[10px] bg-transparent border-none p-0 focus-visible:ring-0 font-bold"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-full text-[9px] font-bold uppercase tracking-widest h-8 border-chocolate/20 text-chocolate hover:bg-strawberry hover:text-white"
                          onClick={() => setShowProductModal(true)}
                        >
                          <Plus size={10} className="mr-1" /> Browse Products
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {formData.offers.map((o, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-cream/10 border border-chocolate/5 space-y-3 relative group overflow-hidden">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            onClick={() => setFormData({ ...formData, offers: formData.offers.filter((_, idx) => idx !== i) })}
                          >
                            <X size={10} />
                          </Button>
                          <div className="flex gap-4">
                            {o.image && (
                              <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-white">
                                <img src={o.image} alt={o.name} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1 space-y-2">
                              <h6 className="text-xs font-black text-chocolate line-clamp-1">{o.name}</h6>
                              
                              <div className="flex items-center gap-4">
                                <div className="space-y-1">
                                  <Label className="text-[8px] uppercase tracking-widest ">Discount %</Label>
                                  <Input 
                                    type="number" 
                                    value={parseInt(o.discount) || 0} 
                                    onChange={(e) => {
                                      const newVal = parseInt(e.target.value) || 0;
                                      const origPrice = parseFloat(o.originalPrice.replace('$', '')) || 0;
                                      const newPrice = (origPrice * (1 - newVal / 100)).toFixed(2);
                                      const newOffers = [...formData.offers];
                                      newOffers[i] = {
                                        ...o,
                                        discount: `${newVal}% OFF`,
                                        price: `$${newPrice}`,
                                        badge: `${newVal}% OFF`
                                      };
                                      setFormData({ ...formData, offers: newOffers });
                                    }}
                                    className="h-7 w-16 text-[10px] bg-white border-chocolate/10 font-bold"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[8px] uppercase tracking-widest">Sale Price</Label>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-strawberry">{o.price}</span>
                                    <span className="text-[9px] text-chocolate/30 line-through">{o.originalPrice}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            <div className="flex items-center justify-between p-6 bg-cream/10 border-t border-chocolate/5">
              <div className="flex items-center gap-4">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  className="data-[state=checked]:bg-strawberry"
                />
                <div>
                  <Label className="text-xs font-black uppercase tracking-widest">Set as Active Event</Label>
                  <p className="text-[10px] text-chocolate/40 mt-0.5">Activating this will deactivate current live events.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={() => setShowFormModal(false)} className="rounded-full px-8 text-chocolate font-bold">Cancel</Button>
                <Button type="submit" className="bg-chocolate hover:bg-strawberry rounded-full px-8 text-xs font-black uppercase tracking-[0.2em]">Save Celebration</Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Product Selector Modal --- */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="sm:max-w-3xl bg-white rounded-[3rem] p-8 overflow-hidden border-none shadow-2xl flex flex-col max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-chocolate font-playfair uppercase">Select Product for Offer</DialogTitle>
            <DialogDescription className="text-chocolate/60">
              Pick a product to add to this event. We'll apply the <strong>{discountPercent}% discount</strong> automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto mt-6 pr-2 -mr-2 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p._id} className="group p-3 rounded-3xl bg-cream/20 border border-chocolate/5 hover:border-strawberry/40 hover:bg-white hover:shadow-xl transition-all cursor-pointer flex flex-col" onClick={() => handleAddProductOffer(p)}>
                  <div className="aspect-square rounded-2xl overflow-hidden mb-3 relative">
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                      <Plus size={24} className="text-white scale-0 group-hover:scale-100 transition-transform" />
                    </div>
                  </div>
                  <h6 className="text-[11px] font-black text-chocolate line-clamp-1">{p.name}</h6>
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-[10px] font-bold text-chocolate/40">${p.price.toFixed(2)}</span>
                    <div className="px-2 py-0.5 rounded-full bg-strawberry/10 text-strawberry text-[8px] font-black uppercase">
                      → ${ (p.price * (1 - discountPercent / 100)).toFixed(2) }
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="py-20 text-center opacity-30 italic">No products found...</div>
            )}
          </div>

          <Button onClick={() => setShowProductModal(false)} variant="ghost" className="mt-6 rounded-full font-bold uppercase tracking-widest text-[10px]">Close</Button>
        </DialogContent>
      </Dialog>

      {/* --- Save Options Prompt Modal --- */}
      <Dialog open={showSavePrompt} onOpenChange={setShowSavePrompt}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-chocolate uppercase">Date Changed</DialogTitle>
            <DialogDescription className="text-chocolate/70">
              You've changed the dates for this event. Do you want to update the existing event, or save this as an entirely new event?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button onClick={() => confirmSave(false)} variant="outline" className="w-full rounded-2xl border-chocolate/20 text-chocolate hover:bg-chocolate/5">
              Update Existing Event
            </Button>
            <Button onClick={() => confirmSave(true)} className="w-full rounded-2xl bg-strawberry hover:bg-strawberry/90 text-white font-bold">
              Save as New Event
            </Button>
            <Button onClick={() => setShowSavePrompt(false)} variant="ghost" className="w-full text-chocolate/50 mt-2 hover:bg-transparent">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsAdmin;
