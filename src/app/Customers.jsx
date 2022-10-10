import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {filterCustomers, getPSCs} from "../store/CustomersSlice";

export const Customers = () => {
	const dispatch = useDispatch();
	const customers = useSelector(state => state.customers.displayed);
	const customersStatus = useSelector(state => state.customers.status);
	const start = useSelector(state => state.customers.start);
	const customersCount = useSelector(state => state.customers.customersCount);
	const startingWith = useSelector(state => state.customers.startingWith);
	const error = useSelector(state => state.customers.error);

	useEffect(() => {
		if (customersStatus === 'idle') {
			dispatch(getPSCs());
		}

		if (customersStatus === 'succeeded') {
			dispatch(filterCustomers({startingWith, start}));
			window.onscroll = () => {
				if (customersCount > start && document.documentElement.scrollTop > (document.documentElement.getBoundingClientRect().height / 3 * 2)) {
					console.log(start)
					console.log(customersCount);
					dispatch(filterCustomers({startingWith, start: start + 100}));
				}
			}

		}
	}, [customersStatus, customersCount, start, dispatch]);

	if (error) {
		alert(`We are sorry, but something went wrong. Please try it again later. Error: ${error}`);
	}

	return (
		<div className="Customers">
			{
			customers.length > 0 ?
				<table>
					<thead>
					<tr>
						<th>Code</th>
						<th>Name</th>
						<th>PSC</th>
					</tr>
					</thead>
					<tbody>
					{
						customers.map(c => (
							<tr key={c.id}>
								<td>{c.kod}</td>
								<td>{c.nazev}</td>
								<td>{c.psc}</td>
							</tr>
						))
					}
					</tbody>
				</table> :
				<div>In this folder aren't any customers, go deeper or higher in folders</div>
			}
		</div>
	);
}