import { configureStore } from '@reduxjs/toolkit';
import customerReducer from "./CustomersSlice";

const store = configureStore({
	middleware: getDefaultMiddleware => getDefaultMiddleware({serializableCheck: false}),
	reducer: {
		customers: customerReducer
	},
})


export default store;
