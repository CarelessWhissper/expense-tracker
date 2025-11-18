import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  icon: string;
  iconType?: string;
  receipt?: string | null;
  merchant?: string;
}

interface TransactionsState {
  transactions: Transaction[];
  weeklyBudget: number;
  isLoading: boolean;
  scanError: string | null;
}

interface ScanPayload {
  consumer?: string;
  baseEnc: string;
  fileName: string;
  filetype: string; // jpeg / png
}

interface ScanResponse {
  rspCode: string;
  rspMsg: string;
  rspObject: {
    uuid: string;
    status: {
      stage: string;
      description: string;
    };
    result: {
      receiptDate: string;
      receiptId: string;
      merchantTaxPayerId: string | null;
      merchantTaxPayerType: string | null;
      recipientTaxPayerId: string | null;
      recipientTaxPayerType: string | null;
      customerNumber: string | null;
      accountNumber: string | null;
      currencyCode: string;
      merchant: {
        name: string;
        address: string;
        city: string;
        state: string | null;
        countryCode: string;
        postalCode: string | null;
        phoneNumber: string;
      };
      recipient: {
        name: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        countryCode: string | null;
        postalCode: string | null;
        phoneNumber: string | null;
      };
      orderDate: string | null;
      dueDate: string | null;
      deliveryDate: string | null;
      poNumber: string | null;
      total: number;
      amountDue: number | null;
      amountPaid: number | null;
      subtotal: number | null;
      tax: number | null;
      serviceCharge: number | null;
      gratuity: number | null;
      priorBalance: number | null;
      discount: number | null;
      shippingCharge: number | null;
      lineItems: {
        item: string;
        qty: number;
        price: number;
        unitPrice: number;
        sku: string | null;
      }[];
    };
  };
}

export const scanTransaction = createAsyncThunk(
  "transaction/scan",
  async (payload: ScanPayload, { rejectWithValue }) => {
    try {
      const body = {
        consumer: payload.consumer || "",
        baseEnc: payload.baseEnc,
        fileName: payload.fileName,
        fileType: payload.filetype,
      };

      // Replace with your actual API endpoint
      const response = await fetch("http://192.168.48.111:8086/budgeteer/api/ocr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Scan failed");
      }

      const data: ScanResponse = await response.json();
      
      if (data.rspCode !== "00") {
        throw new Error(data.rspMsg || "Scan failed");
      }

      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Scan failed");
    }
  }
);

const initialState: TransactionsState = {
  transactions: [
    // Mock data
    {
      id: "1",
      amount: -15.5,
      category: "Food & Drinks",
      description: "Albert Heijn",
      date: new Date().toISOString(),
      icon: "shopping-cart",
      iconType: "MaterialIcons",
    },
    {
      id: "2",
      amount: -45.0,
      category: "Transportation",
      description: "NS Reizen",
      date: new Date(Date.now() - 86400000).toISOString(),
      icon: "train",
      iconType: "MaterialIcons",
    },
    {
      id: "3",
      amount: -8.5,
      category: "Food & Drinks",
      description: "Starbucks",
      date: new Date(Date.now() - 86400000).toISOString(),
      icon: "coffee",
      iconType: "MaterialIcons",
    },
    {
      id: "4",
      amount: 2500.0,
      category: "Income",
      description: "Salary",
      date: new Date(Date.now() - 172800000).toISOString(),
      icon: "attach-money",
      iconType: "MaterialIcons",
    },
    {
      id: "5",
      amount: -125.0,
      category: "Shopping",
      description: "Zara",
      date: new Date(Date.now() - 259200000).toISOString(),
      icon: "shopping-bag",
      iconType: "MaterialIcons",
    },
    {
      id: "6",
      amount: -32.0,
      category: "Entertainment",
      description: "Pathé Bioscoop",
      date: new Date(Date.now() - 345600000).toISOString(),
      icon: "movie",
      iconType: "MaterialIcons",
    },
  ],
  weeklyBudget: 150,
  isLoading: false,
  scanError: null,
};

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    addTransaction(state, action: PayloadAction<Transaction>) {
      state.transactions.unshift(action.payload);
    },
    deleteTransaction(state, action: PayloadAction<string>) {
      state.transactions = state.transactions.filter(
        (t) => t.id !== action.payload
      );
    },
    clearTransactions(state) {
      state.transactions = [];
    },
    setWeeklyBudget(state, action: PayloadAction<number>) {
      state.weeklyBudget = action.payload;
    },
    clearScanError(state) {
      state.scanError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(scanTransaction.pending, (state) => {
        state.isLoading = true;
        state.scanError = null;
      })
      .addCase(scanTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.scanError = null;
        
        // Auto-fill transaction from scan result
        const result = action.payload.rspObject.result;
        const newTransaction: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          amount: -result.total, // Negative for expense
          category: "Shopping", // Default category, user can change
          description: result.merchant.name,
          date: new Date().toISOString(),
          icon: "receipt",
          iconType: "MaterialIcons",
          merchant: result.merchant.name,
        };
        
        state.transactions.unshift(newTransaction);
      })
      .addCase(scanTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.scanError = action.payload as string;
      });
  },
});

export const {
  addTransaction,
  deleteTransaction,
  clearTransactions,
  setWeeklyBudget,
  clearScanError,
} = transactionsSlice.actions;

export default transactionsSlice.reducer;