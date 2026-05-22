import { Shell } from "@/components/layout/Shell";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Settings2, Truck, Receipt, Percent, CheckCircle2, Store, Clock } from "lucide-react";

const SETTINGS_KEY = "rfc_admin_settings";

const settingsSchema = z.object({
  storeName:         z.string().min(1, "Required"),
  storePhone:        z.string().min(1, "Required"),
  taxRate:           z.coerce.number().min(0).max(100),
  deliveryFee:       z.coerce.number().min(0),
  minOrderAmount:    z.coerce.number().min(0),
  freeDeliveryOver:  z.coerce.number().min(0),
  takeawayDiscount:  z.coerce.number().min(0).max(100),
  maxDeliveryRadius: z.coerce.number().min(0),
  preparationTime:   z.coerce.number().min(1),
  deliveryTime:      z.coerce.number().min(1),
  deliveryEnabled:   z.boolean().default(true),
  takeawayEnabled:   z.boolean().default(true),
});

type SettingsValues = z.infer<typeof settingsSchema>;

const DEFAULT_SETTINGS: SettingsValues = {
  storeName: "Real Farmers Chicken",
  storePhone: "0315-1111000",
  taxRate: 17,
  deliveryFee: 120,
  minOrderAmount: 500,
  freeDeliveryOver: 2500,
  takeawayDiscount: 0,
  maxDeliveryRadius: 10,
  preparationTime: 15,
  deliveryTime: 30,
  deliveryEnabled: true,
  takeawayEnabled: true,
};

export default function Settings() {
  const [saved, setSaved] = useState(false);

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: DEFAULT_SETTINGS,
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as Partial<SettingsValues>;
        form.reset({ ...DEFAULT_SETTINGS, ...stored });
      }
    } catch {}
  }, []);

  const onSubmit = (values: SettingsValues) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(values));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Shell>
      <div className="flex flex-col gap-8 pb-10">
        {/* Header */}
        <div className="flex items-start justify-between flex-col md:flex-row gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-primary flex items-center gap-3">
              <Settings2 className="w-8 h-8" /> App Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure tax, delivery fees, order limits, and service options.
            </p>
          </div>
          {saved && (
            <div className="flex items-center gap-2 text-sm font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
              <CheckCircle2 className="w-4 h-4" /> Settings saved!
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            {/* ── Store Info ── */}
            <section className="bg-card border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b bg-muted/30">
                <Store className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-base text-foreground">Store Information</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField control={form.control} name="storeName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Store Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="storePhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Contact Phone</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </section>

            {/* ── Pricing & Tax ── */}
            <section className="bg-card border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b bg-muted/30">
                <Receipt className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-base text-foreground">Pricing & Tax</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <FormField control={form.control} name="taxRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold flex items-center gap-1"><Percent className="w-3 h-3" /> Tax Rate (%)</FormLabel>
                    <FormControl><Input type="number" step="0.1" min="0" max="100" {...field} /></FormControl>
                    <p className="text-xs text-muted-foreground mt-1">Applied to all orders at checkout</p>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="deliveryFee" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold flex items-center gap-1"><Truck className="w-3 h-3" /> Delivery Fee (Rs.)</FormLabel>
                    <FormControl><Input type="number" min="0" {...field} /></FormControl>
                    <p className="text-xs text-muted-foreground mt-1">Charged per delivery order</p>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="freeDeliveryOver" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Free Delivery Over (Rs.)</FormLabel>
                    <FormControl><Input type="number" min="0" {...field} /></FormControl>
                    <p className="text-xs text-muted-foreground mt-1">Set 0 to always charge delivery</p>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="minOrderAmount" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Min. Order Amount (Rs.)</FormLabel>
                    <FormControl><Input type="number" min="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="takeawayDiscount" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Takeaway Discount (%)</FormLabel>
                    <FormControl><Input type="number" min="0" max="100" {...field} /></FormControl>
                    <p className="text-xs text-muted-foreground mt-1">Optional discount for self-pickup</p>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="maxDeliveryRadius" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Max Delivery Radius (km)</FormLabel>
                    <FormControl><Input type="number" min="0" step="0.5" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </section>

            {/* ── Timings ── */}
            <section className="bg-card border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b bg-muted/30">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-base text-foreground">Preparation & Delivery Times</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField control={form.control} name="preparationTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Preparation Time (min)</FormLabel>
                    <FormControl><Input type="number" min="1" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="deliveryTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Delivery Time (min)</FormLabel>
                    <FormControl><Input type="number" min="1" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </section>

            {/* ── Order Types ── */}
            <section className="bg-card border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b bg-muted/30">
                <Truck className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-base text-foreground">Active Order Types</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="deliveryEnabled" render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border">
                    <div>
                      <FormLabel className="font-semibold text-base">Delivery</FormLabel>
                      <p className="text-xs text-muted-foreground mt-0.5">Allow customers to order delivery</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-primary" />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="takeawayEnabled" render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border">
                    <div>
                      <FormLabel className="font-semibold text-base">Takeaway</FormLabel>
                      <p className="text-xs text-muted-foreground mt-0.5">Allow customers to pick up orders</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-primary" />
                    </FormControl>
                  </FormItem>
                )} />
                <div className="flex items-center justify-between p-4 bg-muted/10 rounded-xl border border-dashed opacity-50 md:col-span-2">
                  <div>
                    <p className="font-semibold text-base">Dine-In</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Permanently disabled per business decision</p>
                  </div>
                  <Switch checked={false} disabled />
                </div>
              </div>
            </section>

            {/* Save */}
            <div className="flex justify-end">
              <Button type="submit" className="bg-primary hover:bg-primary/90 px-10 py-3 text-base font-bold shadow-md">
                {saved ? <><CheckCircle2 className="w-4 h-4 mr-2" />Saved!</> : "Save Settings"}
              </Button>
            </div>

          </form>
        </Form>
      </div>
    </Shell>
  );
}
