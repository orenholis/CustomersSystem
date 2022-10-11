import {config} from "../../../config/config";

export default class Node {
	value;
	children = {};
	childrenCount = 0;
	values = [];
	parent;

	constructor(value, parent) {
		this.value = value;
		this.parent = parent;
	}

	addAll(key, data) {
		for (const e of data) {
			this.add(e[key], e);
		}
	}

	add(item, val) {
		const char = item.charAt(0);

		if (char === '') {
			this.values.push(val);
			return;
		}

		this.childrenCount++;

		if (!this.children[char]) {
			this.children[char] = new Node(char, this);
		}

		this.children[char].add(item.slice(1), val);
	}

	getNodeValue(startString='', parentValue) {
		let vals = [];
		const char = startString.replace(this.value, '').charAt(0);

		if (this.childrenCount > 0) {
			for (const c of Object.values(this.children)) {
				if (!char || char === c.value) {
					const x = c.getNodeValue(startString.slice(1), this.value);
					vals = vals.concat(x);
				}
			}
		}

		return vals.concat(char === '' || char === parentValue ? this.values : []);
	}

	getPSCPref() {
		let psc = this.value;

		let parent = this.parent;

		while (parent) {
			psc = parent.value + psc;
			parent = parent.parent;
		}

		return psc;
	}

	getNodesWithAtLeastChildren(childrenAtLeast) {
		const nodes = [];
		const cutOffSmallerChildren = node => Object.values(node.children).filter(n => n.childrenCount >= childrenAtLeast).sort((a, b) => b.childrenCount - a.childrenCount);

		const goThrewChildren = children => {
			for (const c of children) {
				const cutOffChildren = cutOffSmallerChildren(c);

				if (cutOffChildren.length === 0) {
					nodes.push(c);
				} else {
					return goThrewChildren(cutOffChildren);
				}
			}
		}

		goThrewChildren(cutOffSmallerChildren(this));
		return nodes;
	}

	divideIntoGroups(groups=config.kohort_filter_number) {
		const groupRoots = {
			others: {}
		};

		let childrenByCount = Object.values(this.children).sort((a, b) => b.childrenCount - a.childrenCount);
		let othersSize = 0;

		for (let i = groups - 1; i < childrenByCount.length; i++) {
			othersSize += childrenByCount[i].childrenCount;
		}

		if (othersSize < childrenByCount[0].childrenCount && childrenByCount.length > groups) {
			const newNodes = {};
			// Minus one because others is group too
			for (let i = groups - 2; i > 0; i--) {
				const value = childrenByCount[i].childrenCount;

				for (let j = 0; j < i; j++) {
					const nodes = childrenByCount[j].getNodesWithAtLeastChildren(value);

					// Removing duplicities
					for (const n of nodes) {
						newNodes[n.getPSCPref()] = n;
					}
				}
			}

			childrenByCount = childrenByCount.concat(Object.values(newNodes));
			childrenByCount.sort((a, b) => b.childrenCount - a.childrenCount);
		}

		let i = 0;
		for (const c of childrenByCount) {
			if (groups > ++i) {
				groupRoots[c.getPSCPref()] = c;
			} else {
				groupRoots.others[c.getPSCPref()] = c;
			}
		}

		return groupRoots;
	}

	drillDownToOthersLevel(level) {
		let groups = this.divideIntoGroups();

		for (let i = 0; i < level; i++) {
			const r = new Node(this.value);
			r.addAll('psc', this.getOthersValue(groups.others));
			groups = r.divideIntoGroups();
		}

		return groups;
	}

	getOthersValue(others) {
		let values = [];

		for (const koh of Object.values(others)) {
			// Get values from root directly
			const v = !koh.parent ? koh.values : koh.getNodeValue();
			values = values.concat(v);
		}

		return values;
	}

	getNode(startString='') {
		const char = startString.charAt(0);

		if (!startString) {
			return this;
		}

		for (const c of Object.values(this.children)) {
			if (char === c.value) {
				if (char === c.value && startString.length === 1) {
					return c;
				} else {
					return c.getNode(startString.slice(1));
				}
			}
		}
	}

	getGroupsWithLevel(folder, level) {
		const node = this.getNode(folder);

		if (level) {
			return node.drillDownToOthersLevel(level);
		} else {
			return node.divideIntoGroups();
		}
	}
}