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

		if (customersStatus === 'succeeded' && start === 0) {
			dispatch(filterCustomers({startingWith, start}));
		}
	}, [customersStatus, dispatch]);

	useEffect(() => {
		let scrollDisabled = false;

		const handleScroll = () => {
			if (!scrollDisabled) {
				const scrolledTwoThirds = document.documentElement.scrollTop > (document.documentElement.getBoundingClientRect().height / 3 * 2);
				if (scrolledTwoThirds) {
					scrollDisabled = true;
					dispatch(filterCustomers({startingWith: startingWith, start: start}));
				}
			}
		};

		if (customersCount > start) {
			window.addEventListener('scroll', handleScroll, {passive: true});
		}

		return () => window.removeEventListener('scroll', handleScroll, {passive: true})
	}, [start, customersCount, startingWith, dispatch])

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