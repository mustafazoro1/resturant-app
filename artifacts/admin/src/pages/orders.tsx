import { Shell } from "@/components/layout/Shell";
import { useState, useMemo } from "react";
import { useListAdminOrders, useUpdateAdminOrderStatus, getListAdminOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, ChefHat, Search, MapPin } from "lucide-react";

export default function Orders() {
  const { data: orders, isLoading } = useListAdminOrders();
  const updateStatus = useUpdateAdminOrderStatus();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");

  const handleUpdateStatus = (id: string, status: string) => {
    updateStatus.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminOrdersQueryKey() });
        }
      }
    );
  };

  const branches = useMemo(() => {
    if (!orders) return [];
    return Array.from(new Set(orders.map(o => o.branch)));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(o => {
      const matchesSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      const matchesBranch = branchFilter === "all" || o.branch === branchFilter;
      return matchesSearch && matchesStatus && matchesBranch;
    });
  }, [orders, search, statusFilter, branchFilter]);

  if (isLoading) {
    return (
      <Shell>
        <div className="space-y-4">
          <div className="h-10 w-48 bg-muted rounded animate-pulse" />
          <div className="h-12 w-full bg-muted rounded animate-pulse" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex flex-col gap-6 h-full">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Live Orders</h1>
            <p className="text-muted-foreground mt-1">Monitor and process incoming orders.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by customer name or order ID..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-orders"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-branch-filter">
              <SelectValue placeholder="Filter by branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map(b => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-8">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
              No orders found matching your filters.
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="bg-card border rounded-lg p-4 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-muted-foreground">#{order.id.slice(0, 8)}</span>
                    <Badge variant="outline" className="uppercase text-[10px] tracking-wider">{order.orderType}</Badge>
                    {order.status === 'pending' && <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>}
                    {order.status === 'preparing' && <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"><ChefHat className="w-3 h-3 mr-1"/> Preparing</Badge>}
                    {order.status === 'completed' && <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1"/> Completed</Badge>}
                    {order.status === 'cancelled' && <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0"><XCircle className="w-3 h-3 mr-1"/> Cancelled</Badge>}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{order.customerName} <span className="text-muted-foreground text-sm font-normal">({order.customerPhone})</span></h3>
                    <div className="flex items-center text-sm text-muted-foreground gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {order.branch} • {format(new Date(order.createdAt), "h:mm a")}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-muted-foreground">Items: </span>
                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
                  </div>
                </div>
                
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4">
                  <div className="text-xl font-bold">
                    Rs {order.total}
                  </div>
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'preparing')} data-testid={`btn-prepare-${order.id}`}>
                        Start Preparing
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateStatus(order.id, 'completed')} data-testid={`btn-complete-${order.id}`}>
                        Mark Completed
                      </Button>
                    )}
                    {(order.status === 'pending' || order.status === 'preparing') && (
                      <Button size="sm" variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleUpdateStatus(order.id, 'cancelled')} data-testid={`btn-cancel-${order.id}`}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Shell>
  );
}
