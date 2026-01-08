export class BracketHelper {
	private static resolveRosterIdInternal(ref: any, bracket: any[], depth: number): number | null {
		if (ref == null) return null;
		if (typeof ref === 'number') return ref;
		if (depth > 10) return null;

		if (typeof ref === 'object' && ref.m != null && Array.isArray(bracket)) {
			const matchObj = ref;
			if (matchObj.w != null) return Number(matchObj.w);
			if (matchObj.l != null) return Number(matchObj.l);
			return BracketHelper.resolveRosterIdInternal(
				matchObj.t1 ?? matchObj.t2 ?? matchObj.t1_from ?? matchObj.t2_from,
				bracket,
				depth + 1
			);
		}

		if (typeof ref === 'object') {
			if (ref.w != null || ref.l != null) {
				const matchId = Number(ref.w ?? ref.l);
				const match = Array.isArray(bracket)
					? bracket.find((m: any) => Number(m.m) === matchId)
					: undefined;
				if (!match) return null;
				if (match.w != null) return Number(match.w);
				if (match.l != null) return Number(match.l);
				return BracketHelper.resolveRosterIdInternal(
					match.t1 ?? match.t2 ?? match.t1_from ?? match.t2_from,
					bracket,
					depth + 1
				);
			}

			if (ref.t1 != null || ref.t2 != null) {
				return BracketHelper.resolveRosterIdInternal(ref.t1 ?? ref.t2, bracket, depth + 1);
			}

			if (ref.t1_from != null || ref.t2_from != null) {
				return BracketHelper.resolveRosterIdInternal(
					ref.t1_from ?? ref.t2_from,
					bracket,
					depth + 1
				);
			}
		}

		return null;
	}

	static resolveRosterId(ref: any, bracket: any[]): number | null {
		return BracketHelper.resolveRosterIdInternal(ref, bracket, 0);
	}

	static getFinalWinnerRosterId(bracket: any[]): number {
		if (!Array.isArray(bracket) || bracket.length === 0) return 0;

		const rounds = bracket.map((m: any) => Number(m.r ?? 0)).filter((n) => !Number.isNaN(n));
		const finalRound = rounds.length ? Math.max(...rounds) : 0;
		if (!finalRound) return 0;

		const finalMatches = bracket.filter((m: any) => Number(m.r) === finalRound);
		const match = finalMatches.find((m: any) => m.w != null || m.l != null) ?? finalMatches[0];
		if (!match) return 0;

		if (match.w != null) return Number(match.w);

		const resolvedT1 = BracketHelper.resolveRosterId(match.t1 ?? match.t1_from, bracket);
		const resolvedT2 = BracketHelper.resolveRosterId(match.t2 ?? match.t2_from, bracket);

		if (resolvedT1 != null && resolvedT2 == null) return resolvedT1;
		if (resolvedT2 != null && resolvedT1 == null) return resolvedT2;
		return 0;
	}
}
