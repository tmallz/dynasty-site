export class RosterSorter {
	static assignRoles(players: any[]): any[] {
		const roleOrder = ['QB', 'RB', 'RB', 'WR', 'WR', 'WR', 'TE', 'FLEX', 'FLEX', 'SUPER-FLEX'];
		const roleCounts: Record<string, number> = {
			QB: 0,
			RB: 0,
			WR: 0,
			TE: 0,
			FLEX: 0,
			'SUPER-FLEX': 0
		};
		const roleLimits: Record<string, number> = {
			QB: 1,
			RB: 2,
			WR: 3,
			TE: 1,
			FLEX: 2,
			'SUPER-FLEX': 1
		};

		// Sort players by depth_chart_order (or default to 999)
		players.sort((a, b) => (a.depth_chart_order ?? 999) - (b.depth_chart_order ?? 999));

		const orderedPlayers: any[] = [];

		roleOrder.forEach((role) => {
			const player = players.find((p) => {
				if (role === 'FLEX') {
					// FLEX: any RB, WR, TE
					return ['RB', 'WR', 'TE'].includes(p.position) && !orderedPlayers.includes(p);
				} else if (role === 'SUPER-FLEX') {
					// SUPER-FLEX: any QB, RB, WR, TE
					return ['QB', 'RB', 'WR', 'TE'].includes(p.position) && !orderedPlayers.includes(p);
				} else {
					// Primary roles (QB, RB, WR, TE)
					return (
						p.position === role &&
						roleCounts[role] < roleLimits[role] &&
						!orderedPlayers.includes(p)
					);
				}
			});

			if (player) {
				// Assign display labels: FLEX to WRT and SUPER-FLEX to WRTQ
				player.role = role === 'FLEX' ? 'WRT' : role === 'SUPER-FLEX' ? 'WRTQ' : role;
				roleCounts[role]++;
				orderedPlayers.push(player);
			}
		});

		return orderedPlayers;
	}

	static getBadgeClass(position: string): string {
		switch (position) {
			case 'QB':
				return 'bg-qb'; // Custom class for QB
			case 'RB':
				return 'bg-rb'; // Custom class for RB
			case 'WR':
				return 'bg-wr'; // Custom class for WR
			case 'TE':
				return 'bg-te'; // Custom class for TE
			case 'WRT':
				return 'bg-wrt'; // Shared class for FLEX (WRT)
			case 'WRTQ':
				return 'bg-wrtq'; // Shared class for SUPER-FLEX (WRTQ)
			default:
				return 'badge-neutral';
		}
	}
}
