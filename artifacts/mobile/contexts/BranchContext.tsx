import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { BRANCHES, Branch } from "@/constants/data";

interface BranchContextType {
  selectedBranch: Branch | null;
  selectBranch: (branch: Branch) => void;
  orderType: "takeaway" | "delivery";
  setOrderType: (type: "takeaway" | "delivery") => void;
}

const BranchContext = createContext<BranchContextType>({
  selectedBranch: null,
  selectBranch: () => {},
  orderType: "takeaway",
  setOrderType: () => {},
});

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(
    BRANCHES[0],
  );
  const [orderType, setOrderTypeState] = useState<"takeaway" | "delivery">(
    "takeaway",
  );

  useEffect(() => {
    AsyncStorage.getItem("rfc_branch").then((data) => {
      if (data) {
        try {
          const branch = JSON.parse(data) as Branch;
          setSelectedBranch(branch);
        } catch {}
      }
    });
    AsyncStorage.getItem("rfc_order_type").then((data) => {
      if (data === "takeaway" || data === "delivery") {
        setOrderTypeState(data);
      }
    });
  }, []);

  const selectBranch = useCallback((branch: Branch) => {
    setSelectedBranch(branch);
    AsyncStorage.setItem("rfc_branch", JSON.stringify(branch));
  }, []);

  const setOrderType = useCallback((type: "takeaway" | "delivery") => {
    setOrderTypeState(type);
    AsyncStorage.setItem("rfc_order_type", type);
  }, []);

  return (
    <BranchContext.Provider
      value={{ selectedBranch, selectBranch, orderType, setOrderType }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export const useBranch = () => useContext(BranchContext);
