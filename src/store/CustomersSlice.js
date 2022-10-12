import {createAsyncThunk} from "@reduxjs/toolkit/src/createAsyncThunk";
import {createSlice} from "@reduxjs/toolkit";
import Node from "../app/utils/Kohorta";
import {getURLSearchParam, pushNewURLParams} from "../app/utils/utils";
import {config} from "../../config/config";

export const getPSCs = createAsyncThunk(
	'customers/getCustomers',
	async () => {
		const data = await fetch(`https://demo.flexibee.eu/v2/c/demo/adresar.json?start=0&limit=0&detail=custom:psc`);
		return (await data.json()).winstrom.adresar;
	})

export const filterCustomers = createAsyncThunk(
	'customers/filterCustomers',
	async ({startingWith, start}) => {
		const url = `https://demo.flexibee.eu/v2/c/demo/adresar/(${startingWith.map(psc => `psc begins '${psc}'`).join(' or ')}).json?start=${start}&limit=${config.customers_loaded_limit}&add-row-count=${(start === 0)}`;

		const data = await fetch(`${url}`);
		const json = await data.json()
		const customers = json.winstrom.adresar;

		return {
			customers,
			start,
			count: json.winstrom['@rowCount'],
			startingWith
		};
	}
);

export const customersSlice = createSlice({
	name: 'customers',
	initialState: {
		status: 'idle',
		error: null,

		rootKohort: null,
		customersCount: 0,

		// Customers
		displayed: [],
		start: 0,

		// Filters
		startingWith: '',
		othersLevel: 0,
		folder: ''
	},
	reducers: {
		setFilters(state, action) {
			state.othersLevel = action.payload.othersLevel;
			state.folder = action.payload.folder;

			const params = new URLSearchParams('');

			for (const s of action.payload.startingWith) {
				params.append('startingWith', s);
			}

			params.append('folder', state.folder);
			params.append('othersLevel', state.othersLevel);
			pushNewURLParams(params);
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(getPSCs.pending, (state, action) => {
				state.status = 'loading'
			})
			.addCase(getPSCs.fulfilled, (state, action) => {
				state.status = 'succeeded';

				state.rootKohort = new Node('');
				state.rootKohort.addAll('psc', action.payload);
				state.startingWith = (new URLSearchParams(location.search)).getAll('startingWith') || '';
				state.folder = getURLSearchParam('folder') || '';
				state.othersLevel = Number(getURLSearchParam('othersLevel')) || 0;
			})
			.addCase(getPSCs.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.error.message
			});

		builder
			.addCase(filterCustomers.fulfilled, (state, action) => {
				const customers = action.payload.customers;
				state.displayed = action.payload.start === 0 ? customers : state.displayed.concat(customers);
				state.start = action.payload.start + 100;
				state.customersCount = action.payload.count ? Number(action.payload.count) : state.customersCount;
				state.startingWith = action.payload.startingWith;
			})
			.addCase(filterCustomers.rejected, (state, action) => {
				state.error = action.error.message
			});
	},
});

export const {setFilters} = customersSlice.actions;
export default customersSlice.reducer;