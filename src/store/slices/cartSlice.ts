import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CartLine {
  courseId: string;
  title: string;
  finalPrice: number;
  isPaid: boolean;
  quantity: number;
}

export interface CartState {
  items: CartLine[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{
        courseId: string;
        title: string;
        finalPrice: number;
        isPaid: boolean;
        quantity?: number;
      }>,
    ) => {
      const q = action.payload.quantity ?? 1;
      const existing = state.items.find(
        (i) => i.courseId === action.payload.courseId,
      );
      if (existing) {
        existing.quantity += q;
      } else {
        state.items.push({
          courseId: action.payload.courseId,
          title: action.payload.title,
          finalPrice: action.payload.finalPrice,
          isPaid: action.payload.isPaid,
          quantity: q,
        });
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.courseId !== action.payload);
    },
    setLineQuantity: (
      state,
      action: PayloadAction<{ courseId: string; quantity: number }>,
    ) => {
      const line = state.items.find((i) => i.courseId === action.payload.courseId);
      if (!line) return;
      if (action.payload.quantity <= 0) {
        state.items = state.items.filter(
          (i) => i.courseId !== action.payload.courseId,
        );
      } else {
        line.quantity = action.payload.quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, setLineQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
