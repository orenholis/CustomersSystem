import {useDispatch, useSelector} from "react-redux";
import {filterCustomers, setFilters} from "../store/CustomersSlice";
import {useEffect} from "react";

export const KohortsList = () => {
	const dispatch = useDispatch();
	const rootKohort = useSelector(state => state.customers.rootKohort);
	const folder = useSelector(state => state.customers.folder);
	const level = useSelector(state => state.customers.othersLevel);

	const groups = rootKohort && rootKohort.getGroupsWithLevel(folder, level);

	useEffect(() => {
		window.onpopstate = () => drillUp();
	})

	const getKohortaStartingWith = (koh, others) => others ? Object.values(koh).map(k => k.getPSCPref()) : [koh.getPSCPref()]

	const drillDown = (kohorta, others) => {
		if (Object.keys(groups).length === 1 && others) {
			alert('You have reached lowest level');
			return;
		}

		const startingWith = getKohortaStartingWith(kohorta, others);

		dispatch(filterCustomers({startingWith, start: 0}));
		dispatch(setFilters({
			startingWith,
			othersLevel: others ? level + 1 : 0,
			folder: others ? folder : kohorta.getPSCPref()
		}));
	};

	const drillUp = () => {
		if (folder === '' && !level) {
			alert('You reached top level. You cannot go back anymore.');
			return;
		}

		const prevFolder = level > 0 ? folder : folder.substring(0, folder.length - 1);
		const prevLevel = level > 0 ? level - 1 : 0;

		let startingWith;
		if (level > 1) {
			startingWith = getKohortaStartingWith(rootKohort.getGroupsWithLevel(folder, prevLevel - 1).others, true);
		} else {
			startingWith = getKohortaStartingWith(rootKohort.getNode(prevFolder));
		}

		dispatch(filterCustomers({startingWith, start: 0}));
		dispatch(setFilters({
			startingWith,
			othersLevel: prevLevel,
			folder: prevFolder
		}));
	}

	let othersCustomersCount = groups && rootKohort.getOthersValue(groups.others).length;

	return (
		<div className="Kohorts">
			<h3 className="title">Filter</h3>
			<div className="sidebar">
				<ul>
					{
						groups && Object.keys(groups).map((k, v) => {
							const others = k === 'others';
							const count = groups[k].childrenCount;
							return (count > 0 || others && othersCustomersCount > 0) && (
								<li key={k} onClick={e => drillDown(groups[k], others)}>
									<span className="psc">{others ? 'Others' : 'PSČ'} {others ? '' : k.padEnd(5, '.')}</span>
									<span title="Počet zákazníků" className="number-of-customers">{others ? othersCustomersCount : count}</span>
								</li>
							);
						})
					}
				</ul>
				<button onClick={e => drillUp()}>Go back</button>
			</div>
		</div>
	)
}