import { Shell } from "@/components/layout/Shell";
import { useState, useMemo, useRef } from "react";
import { 
  useListAdminMenuItems, 
  useUpdateAdminMenuItem, 
  useDeleteAdminMenuItem, 
  useCreateAdminMenuItem, 
  getListAdminMenuItemsQueryKey,
  useRequestUploadUrl,
  useListAdminCategories,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flame, Star, Edit, Trash2, Plus, Search, UploadCloud, Loader2, ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  price: z.coerce.number().min(0, "Price must be positive"),
  category: z.string().min(1, "Category is required"),
  spicy: z.boolean().optional().default(false),
  popular: z.boolean().optional().default(false),
  calories: z.coerce.number().nullable().optional(),
  imageUrl: z.string().nullable().optional()
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

export default function Menu() {
  const { data: menuItems, isLoading } = useListAdminMenuItems();
  const { data: categories } = useListAdminCategories();
  const menuItemsArray = Array.isArray(menuItems) ? menuItems : [];
  const categoriesArray = Array.isArray(categories) ? categories : [];

  const queryClient = useQueryClient();
  const updateItem = useUpdateAdminMenuItem();
  const deleteItem = useDeleteAdminMenuItem();
  const createItem = useCreateAdminMenuItem();
  const requestUploadUrl = useRequestUploadUrl();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  const [uploadingImage, setUploadingImage] = useState(false);



  const filterCategories = useMemo(() => {
    if (!menuItemsArray.length) return [];
    return Array.from(new Set(menuItemsArray.map(i => i.category)));
  }, [menuItemsArray]);

  const filteredItems = useMemo(() => {
    if (!menuItemsArray.length) return [];
    return menuItemsArray.filter(i => {
      const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || i.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [menuItemsArray, search, categoryFilter]);

  const handleToggleAvailability = (id: string, available: boolean) => {
    updateItem.mutate(
      { id, data: { available } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAdminMenuItemsQueryKey() }) }
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteItem.mutate(
        { id },
        { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAdminMenuItemsQueryKey() }) }
      );
    }
  };

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      spicy: false,
      popular: false,
      calories: null,
      imageUrl: ""
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const result = await requestUploadUrl.mutateAsync({
        data: { name: file.name, size: file.size, contentType: file.type }
      });
      
      await fetch(result.uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type }
      });

      const servingUrl = `/api/storage${result.objectPath}`;
      form.setValue("imageUrl", servingUrl);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = (values: MenuItemFormValues) => {
    if (editingItemId) {
      updateItem.mutate(
        { id: editingItemId, data: values },
        { 
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListAdminMenuItemsQueryKey() });
            setEditingItemId(null);
            form.reset();
          }
        }
      );
    } else {
      createItem.mutate(
        { data: values },
        { 
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListAdminMenuItemsQueryKey() });
            setIsAddOpen(false);
            form.reset();
          }
        }
      );
    }
  };

  const openEditDialog = (item: any) => {
    form.reset({
      name: item.name,
      description: item.description || "",
      price: item.price,
      category: item.category,
      spicy: item.spicy || false,
      popular: item.popular || false,
      calories: item.calories || null,
      imageUrl: item.imageUrl || ""
    });
    setEditingItemId(item.id);
  };

  const handleOpenChangeAdd = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    setIsAddOpen(open);
  };

  const handleOpenChangeEdit = (open: boolean) => {
    if (!open) {
      setEditingItemId(null);
      form.reset();
    }
  };

  if (isLoading) {
    return (
      <Shell>
        <div className="space-y-6">
          <div className="h-10 w-64 bg-muted rounded animate-pulse" />
          <div className="flex gap-4">
            <div className="h-10 w-full md:w-1/3 bg-muted rounded animate-pulse" />
            <div className="h-10 w-48 bg-muted rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-80 bg-muted rounded-xl animate-pulse" />)}
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex flex-col gap-8 h-full pb-10">
        <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-primary">Menu Management</h1>
            <p className="text-muted-foreground mt-1">Manage items, pricing, availability, and presentation.</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={handleOpenChangeAdd}>
            <DialogTrigger asChild>
              <Button data-testid="btn-add-item" className="bg-primary hover:bg-primary/90">
                <Plus className="w-5 h-5 mr-2" /> Add Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl text-primary font-bold">Add New Menu Item</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Name</FormLabel>
                          <FormControl><Input placeholder="Zinger Burger" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Category</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(categoriesArray ?? []).map(c => (
                                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Price (Rs)</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="calories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Calories (optional)</FormLabel>
                          <FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Description</FormLabel>
                        <FormControl><Textarea className="resize-none" placeholder="Crispy chicken fillet with signature sauce..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Item Image</FormLabel>
                        <div className="flex items-center gap-4">
                          <div className="relative w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 flex items-center justify-center overflow-hidden">
                            {uploadingImage ? (
                              <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            ) : field.value ? (
                              <img src={field.value} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                            )}
                          </div>
                          <div className="flex-1">
                            <FormControl>
                              <Input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileUpload}
                                disabled={uploadingImage}
                                className="cursor-pointer file:text-primary file:font-semibold file:border-0 file:bg-transparent"
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground mt-2">Upload a high-quality image of the item.</p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-8 p-4 bg-muted/20 rounded-lg border border-border/50">
                    <FormField
                      control={form.control}
                      name="spicy"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3 space-y-0">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-destructive data-[state=checked]:border-destructive" /></FormControl>
                          <FormLabel className="m-0 cursor-pointer font-medium flex items-center"><Flame className="w-4 h-4 mr-1 text-destructive" /> Spicy Indicator</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="popular"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3 space-y-0">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500 text-yellow-950" /></FormControl>
                          <FormLabel className="m-0 cursor-pointer font-medium flex items-center"><Star className="w-4 h-4 mr-1 text-yellow-500" /> Popular Item</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={createItem.isPending || uploadingImage} className="w-full md:w-auto px-8">
                      {createItem.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Save Item
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={!!editingItemId} onOpenChange={handleOpenChangeEdit}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl text-primary font-bold">Edit Menu Item</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Name</FormLabel>
                          <FormControl><Input placeholder="Zinger Burger" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Category</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(categoriesArray ?? []).map(c => (
                                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Price (Rs)</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="calories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Calories (optional)</FormLabel>
                          <FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Description</FormLabel>
                        <FormControl><Textarea className="resize-none" placeholder="Crispy chicken fillet with signature sauce..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Item Image</FormLabel>
                        <div className="flex items-center gap-4">
                          <div className="relative w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 flex items-center justify-center overflow-hidden">
                            {uploadingImage ? (
                              <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            ) : field.value ? (
                              <img src={field.value} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                            )}
                          </div>
                          <div className="flex-1">
                            <FormControl>
                              <Input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileUpload}
                                disabled={uploadingImage}
                                className="cursor-pointer file:text-primary file:font-semibold file:border-0 file:bg-transparent"
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground mt-2">Upload a high-quality image of the item.</p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-8 p-4 bg-muted/20 rounded-lg border border-border/50">
                    <FormField
                      control={form.control}
                      name="spicy"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3 space-y-0">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-destructive data-[state=checked]:border-destructive" /></FormControl>
                          <FormLabel className="m-0 cursor-pointer font-medium flex items-center"><Flame className="w-4 h-4 mr-1 text-destructive" /> Spicy Indicator</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="popular"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3 space-y-0">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500 text-yellow-950" /></FormControl>
                          <FormLabel className="m-0 cursor-pointer font-medium flex items-center"><Star className="w-4 h-4 mr-1 text-yellow-500" /> Popular Item</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={updateItem.isPending || uploadingImage} className="w-full md:w-auto px-8">
                      {updateItem.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Update Item
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card border rounded-xl shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search menu items..." 
              className="pl-10 h-11 border-muted-foreground/20 text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-menu"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[220px] h-11 border-muted-foreground/20" data-testid="select-category-filter">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {filterCategories.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-dashed rounded-xl h-64">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-primary/60" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No menu items found</h3>
            <p className="text-muted-foreground mt-2 max-w-md">Try adjusting your search or category filters to find what you're looking for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="group bg-card border rounded-xl overflow-hidden flex flex-col transition-all hover:shadow-lg hover:border-primary/30">
                <div className="h-48 bg-muted relative overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 text-primary/20">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <Badge className="bg-background/90 text-foreground backdrop-blur-md border-0 shadow-sm font-semibold">{item.category}</Badge>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-2">
                    {item.spicy && <Badge variant="destructive" className="shadow-sm shadow-destructive/20 border-0"><Flame className="w-3 h-3 mr-1"/> Spicy</Badge>}
                    {item.popular && <Badge variant="secondary" className="bg-yellow-500 text-yellow-950 hover:bg-yellow-500 shadow-sm border-0"><Star className="w-3 h-3 mr-1"/> Popular</Badge>}
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-bold text-xl leading-tight text-foreground">{item.name}</h3>
                    <div className="font-black text-lg text-primary whitespace-nowrap">Rs {item.price}</div>
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                    {item.description || "No description provided."}
                  </div>
                  {item.calories && (
                    <div className="text-xs text-muted-foreground font-medium bg-muted/50 w-fit px-2 py-1 rounded-md mb-2">
                      {item.calories} kcal
                    </div>
                  )}
                </div>

                <div className="border-t bg-muted/10 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={item.available} 
                      onCheckedChange={(val) => handleToggleAvailability(item.id, val)}
                      data-testid={`switch-available-${item.id}`}
                      className="data-[state=checked]:bg-primary"
                    />
                    <span className={`text-sm font-bold ${item.available ? 'text-primary' : 'text-muted-foreground'}`}>
                      {item.available ? 'Available' : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 text-primary hover:bg-primary/10 hover:text-primary transition-colors" 
                      onClick={() => openEditDialog(item)} 
                      data-testid={`btn-edit-${item.id}`}
                      title="Edit Item"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors" 
                      onClick={() => handleDelete(item.id)} 
                      data-testid={`btn-delete-${item.id}`}
                      title="Delete Item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
