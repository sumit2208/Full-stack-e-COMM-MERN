import { createSlice } from "@reduxjs/toolkit";

export const cartslice = createSlice({
  name: "cart",
  initialState: {
    carts: [],
    TotalPrice: 0,
  },
  reducers: {
    addTocart: (state, action) => {
      const item = action.payload;
      state.carts.push({ ...item, quantity: 1 }); 
    },
  },
});

export const { addTocart } = cartslice.actions; 

export default cartslice.reducer;