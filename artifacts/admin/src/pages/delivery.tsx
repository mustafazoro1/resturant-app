import { Shell } from "@/components/layout/Shell";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MapPin, Clock, Phone, Edit, Truck, Package } from "lucide-react";

interface Branch {
  id: string;
  name: string;
  address: string;
  area: string;
  city: string;
  hours: string;
  isOpen: boolean;
  phone: string;
  deliveryEnabled: boolean;
  deliveryFee: number;
  estimatedTime: string;
}

const INITIAL_BRANCHES: Branch[] = [
  {
    id: "br1",
    name: "Naval Colony",
    address: "Shop #5, Main Road, Naval Colony, Karachi",
    area: "Naval Colony",
    city: "Karachi",
    hours: "10:00 AM - 12:00 AM",
    isOpen: true,
    phone: "0315-1111001",
    deliveryEnabled: true,
    deliveryFee: 80,
    estimatedTime: "25-35 min",
  },
  {
    id: "br2",
    name: "Buns Road",
    address: "Main Buns Road, Near Empress Market, Saddar, Karachi",
    area: "Buns Road",
    city: "Karachi",
    hours: "10:00 AM - 1:00 AM",
    isOpen: true,
    phone: "0315-1111002",
    deliveryEnabled: true,
    deliveryFee: 100,
    estimatedTime: "30-40 min",
  },
  {
    id: "br3",
    name: "DHA Phase 5",
    address: "Khayaban-e-Iqbal, Phase 5, DHA, Karachi",
    area: "DHA",
    city: "Karachi",
    hours: "10:00 AM - 2:00 AM",
    isOpen: true,
    phone: "0315-1111003",
    deliveryEnabled: true,
    deliveryFee: 120,
    estimatedTime: "35-45 min",
  },
  {
    id: "br4",
    name: "Clifton Block 9",
    address: "Dolmen Mall Clifton, Block 9, Clifton, Karachi",
    area: "Clifton",
    city: "Karachi",
    hours: "11:00 AM - 11:00 PM",
    isOpen: true,
    phone: "0315-1111004",
    deliveryEnabled: true,
    deliveryFee: 100,
    estimatedTime: "30-40 min",
  },
  {
    id: "br5",
    name: "North Nazimabad",
    address: "Block F, Main Road, North Nazimabad, Karachi",
    area: "North Nazimabad",
    city: "Karachi",
    hours: "10:00 AM - 11:00 PM",
    isOpen: true,
    phone: "0315-1111005",
    deliveryEnabled: false,
    deliveryFee: 90,
    estimatedTime: "35-50 min",
  },
  {
    id: "br6",
    name: "Gulshan-e-Iqbal",
    address: "Block 13-D, Gulshan-e-Iqbal, Karachi",
    area: "Gulshan",
    city: "Karachi",
    hours: "10:00 AM - 12:00 AM",
    isOpen: false,
    phone: "0315-1111006",
    deliveryEnabled: false,
    deliveryFee: 90,
    estimatedTime: "40-55 min",
  },
  {
    id: "br7",
    name: "Saddar",
    address: "Zaibunissa Street, Saddar Town, Karachi",
    area: "Saddar",
    city: "Karachi",
    hours: "10:00 AM - 10:00 PM",
    isOpen: true,
    phone: "0315-1111007",
    deliveryEnabled: true,
    deliveryFee: 80,
    estimatedTime: "20-30 min",
  },
  {
    id: "br8",
    name: "Malir",
    address: "Main Malir Road, Malir Cantt, Karachi",
    area: "Malir",
    city: "Karachi",
    hours: "10:00 AM - 11:00 PM",
    isOpen: true,
    phone: "0315-1111008",
    deliveryEnabled: true,
    deliveryFee: 110,
    estimatedTime: "40-55 min",
  },
  {
    id: "br9",
    name: "Gulberg",
    address: "MM Alam Road, Gulberg III, Lahore",
    area: "Gulberg",
    city: "Lahore",
    hours: "10:00 AM - 2:00 AM",
    isOpen: true,
    phone: "0315-2222001",
    deliveryEnabled: true,
    deliveryFee: 100,
    estimatedTime: "30-40 min",
  },
  {
    id: "br10",
    name: "DHA Lahore",
    address: "Y Block Commercial, Phase 3, DHA, Lahore",
    area: "DHA",
    city: "Lahore",
    hours: "10:00 AM - 1:00 AM",
    isOpen: true,
    phone: "0315-2222002",
    deliveryEnabled: true,
    deliveryFee: 120,
    estimatedTime: "35-45 min",
  },
  {
    id: "br11",
    name: "F-7 Islamabad",
    address: "F-7 Markaz, Blue Area, Islamabad",
    area: "F-7",
    city: "Islamabad",
    hours: "10:00 AM - 12:00 AM",
    isOpen: true,
    phone: "0315-3333001",
    deliveryEnabled: true,
    deliveryFee: 100,
    estimatedTime: "30-45 min",
  },
];

const branchSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  area: z.string().min(1, "Area is required"),
  city: z.string().min(1, "City is required"),
  hours: z.string().min(1, "Hours are required"),
  phone: z.string().min(1, "Phone is required"),
  deliveryFee: z.coerce.number().min(0),
  estimatedTime: z.string().min(1, "Estimated time is required"),
});

type BranchFormValues = z.infer<typeof branchSchema>;

export default function Delivery() {
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [cityFilter, setCityFilter] = useState("all");

  const cities = Array.from(new Set(branches.map((b) => b.city)));
  const filtered =
    cityFilter === "all"
      ? branches
      : branches.filter((b) => b.city === cityFilter);

  const activeDelivery = branches.filter(
    (b) => b.deliveryEnabled && b.isOpen,
  ).length;
  const totalOpen = branches.filter((b) => b.isOpen).length;

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: "",
      address: "",
      area: "",
      city: "",
      hours: "",
      phone: "",
      deliveryFee: 80,
      estimatedTime: "30-40 min",
    },
  });

  const openEdit = (branch: Branch) => {
    setEditingBranch(branch);
    form.reset({
      name: branch.name,
      address: branch.address,
      area: branch.area,
      city: branch.city,
      hours: branch.hours,
      phone: branch.phone,
      deliveryFee: branch.deliveryFee,
      estimatedTime: branch.estimatedTime,
    });
  };

  const onSubmit = (values: BranchFormValues) => {
    if (editingBranch) {
      setBranches((prev) =>
        prev.map((b) => (b.id === editingBranch.id ? { ...b, ...values } : b)),
      );
      setEditingBranch(null);
      form.reset();
    }
  };

  const toggleOpen = (id: string) =>
    setBranches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isOpen: !b.isOpen } : b)),
    );
  const toggleDelivery = (id: string) =>
    setBranches((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, deliveryEnabled: !b.deliveryEnabled } : b,
      ),
    );

  return (
    <Shell>
      <div className="flex flex-col gap-8 pb-10">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">
            Delivery & Branch Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage branch availability, delivery settings, and order types.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border rounded-xl p-5 flex flex-col gap-1">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Total Branches
            </p>
            <p className="text-3xl font-extrabold text-foreground">
              {branches.length}
            </p>
          </div>
          <div className="bg-card border rounded-xl p-5 flex flex-col gap-1">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Open Now
            </p>
            <p className="text-3xl font-extrabold text-primary">{totalOpen}</p>
          </div>
          <div className="bg-card border rounded-xl p-5 flex flex-col gap-1">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Delivering
            </p>
            <p className="text-3xl font-extrabold text-emerald-600">
              {activeDelivery}
            </p>
          </div>
          <div className="bg-card border rounded-xl p-5 flex flex-col gap-1">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Order Types
            </p>
            <div className="flex gap-1 mt-1">
              <Badge className="bg-primary text-white text-xs">
                <Truck className="w-3 h-3 mr-1" />
                Delivery
              </Badge>
              <Badge className="bg-orange-500 text-white text-xs">
                <Package className="w-3 h-3 mr-1" />
                Takeaway
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dine-in removed
            </p>
          </div>
        </div>

        {/* City filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {["all", ...cities].map((city) => (
            <button
              key={city}
              onClick={() => setCityFilter(city)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                cityFilter === city
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {city === "all"
                ? `All Cities (${branches.length})`
                : `${city} (${branches.filter((b) => b.city === city).length})`}
            </button>
          ))}
        </div>

        {/* Branch list */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((branch) => (
            <div
              key={branch.id}
              className={`bg-card border rounded-xl overflow-hidden flex flex-col transition-all hover:shadow-md ${!branch.isOpen ? "opacity-60" : ""}`}
            >
              {/* Status bar */}
              <div
                className={`h-2 w-full ${branch.isOpen ? "bg-gradient-to-r from-primary to-primary/60" : "bg-muted-foreground/20"}`}
              />
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-lg text-foreground leading-tight">
                      RFC {branch.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {branch.city}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {branch.isOpen ? (
                      <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                        Open
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs font-bold">
                        Closed
                      </Badge>
                    )}
                    {branch.deliveryEnabled && branch.isOpen && (
                      <Badge className="bg-green-100 text-green-700 border border-green-200 text-xs font-bold">
                        <Truck className="w-3 h-3 mr-1" />
                        Live
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary/60" />
                    <span className="text-xs leading-tight">
                      {branch.address}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 shrink-0 text-primary/60" />
                    <span className="text-xs">{branch.hours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-primary/60" />
                    <span className="text-xs">{branch.phone}</span>
                  </div>
                </div>

                {/* Delivery info */}
                <div className="rounded-lg bg-muted/40 p-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Delivery
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Rs. {branch.deliveryFee} fee • {branch.estimatedTime}
                    </p>
                  </div>
                  <Switch
                    checked={branch.deliveryEnabled}
                    onCheckedChange={() => toggleDelivery(branch.id)}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>

              <div className="border-t p-3 flex items-center justify-between bg-muted/10">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={branch.isOpen}
                    onCheckedChange={() => toggleOpen(branch.id)}
                    className="data-[state=checked]:bg-primary"
                  />
                  <span
                    className={`text-xs font-bold ${branch.isOpen ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {branch.isOpen ? "Open" : "Closed"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-primary hover:bg-primary/10"
                  onClick={() => openEdit(branch)}
                >
                  <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog
          open={!!editingBranch}
          onOpenChange={(open) => {
            if (!open) {
              setEditingBranch(null);
              form.reset();
            }
          }}
        >
          <DialogContent className="max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <DialogHeader className="shrink-0">
              <DialogTitle className="text-xl text-primary font-bold">
                Edit Branch — RFC {editingBranch?.name}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 overflow-y-auto flex-1 pr-1"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operating Hours</FormLabel>
                      <FormControl>
                        <Input placeholder="10:00 AM - 12:00 AM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="deliveryFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Fee (Rs.)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="estimatedTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Time</FormLabel>
                        <FormControl>
                          <Input placeholder="30-40 min" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" className="px-8">
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </Shell>
  );
}
