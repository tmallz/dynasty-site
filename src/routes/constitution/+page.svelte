<script lang="ts">
	let tocExpanded = $state(false);
</script>

<main class="bg-base-200 text-base-content flex scroll-smooth flex-col items-center p-6">
	<div class="w-full max-w-4xl">
		<!-- Title -->
		<h1 class="mb-8 text-center text-4xl font-bold animate-fade-in">League Constitution</h1>

		<!-- Table of Contents -->
		<div class="card bg-base-100 mb-8 shadow-lg animate-fade-in-delay-1">
			<div class="card-body">
				<!-- Mobile: Collapsible TOC -->
				<div class="md:hidden">
					<button
						class="btn btn-ghost w-full justify-between text-xl font-semibold"
						onclick={() => (tocExpanded = !tocExpanded)}
					>
						Table of Contents
						<svg
							class="h-5 w-5 transition-transform {tocExpanded ? 'rotate-180' : ''}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>
					{#if tocExpanded}
						<ul class="menu mt-2">
							<li><a href="#roster" class="hover:text-primary">Section 1: Roster</a></li>
							<li><a href="#drafting" class="hover:text-primary">Section 2: Drafting</a></li>
							<li><a href="#scoring" class="hover:text-primary">Section 3: Scoring System</a></li>
							<li><a href="#Postseason" class="hover:text-primary">Section 4: Postseason</a></li>
							<li><a href="#tanking" class="hover:text-primary">Section 5: Tanking Policy</a></li>
							<li><a href="#finances" class="hover:text-primary">Section 6: Finances</a></li>
							<li><a href="#rules" class="hover:text-primary">Section 7: League Rules</a></li>
						</ul>
					{/if}
				</div>

				<!-- Desktop: Always visible TOC -->
				<div class="hidden md:block">
					<h2 class="mb-4 text-center text-2xl font-semibold">Table of Contents</h2>
					<ul class="menu">
						<li><a href="#roster" class="hover:text-primary">Section 1: Roster</a></li>
						<li><a href="#drafting" class="hover:text-primary">Section 2: Drafting</a></li>
						<li><a href="#scoring" class="hover:text-primary">Section 3: Scoring System</a></li>
						<li><a href="#Postseason" class="hover:text-primary">Section 4: Postseason</a></li>
						<li><a href="#tanking" class="hover:text-primary">Section 5: Tanking Policy</a></li>
						<li><a href="#finances" class="hover:text-primary">Section 6: Finances</a></li>
						<li><a href="#rules" class="hover:text-primary">Section 7: League Rules</a></li>
					</ul>
				</div>
			</div>
		</div>

		<!-- Section 1: Roster -->
		<section id="roster" class="card bg-base-100 mb-6 shadow-lg animate-fade-in-delay-2">
			<div class="card-body">
				<h2 class="card-title text-3xl font-bold">Section 1: Roster</h2>

				<div class="collapse collapse-arrow bg-base-200 mt-4">
					<input type="checkbox" checked />
					<div class="collapse-title text-xl font-semibold">1.1 Positional Breakdown</div>
					<div class="collapse-content">
						<p class="mb-2">
							<span class="badge badge-primary badge-lg">25 Total Players</span>
							<span class="ml-2 text-sm text-base-content/70">No position maximums</span>
						</p>

						<h4 class="mt-4 text-lg font-semibold">Starters</h4>
						<ul class="list-inside list-disc space-y-1 pl-2">
							<li>1 QB</li>
							<li>2 RB</li>
							<li>3 WR</li>
							<li>1 TE</li>
							<li>2 FLEX (RB/WR/TE)</li>
							<li>1 FLEX (QB/RB/WR/TE)</li>
						</ul>

						<h4 class="mt-4 text-lg font-semibold">Bench</h4>
						<ul class="list-inside list-disc space-y-1 pl-2">
							<li><span class="badge badge-outline">15</span> Bench Spots</li>
						</ul>

						<h4 class="mt-4 text-lg font-semibold">Injured Reserve</h4>
						<ul class="list-inside list-disc space-y-1 pl-2">
							<li>
								<span class="badge badge-outline">4</span> IR Spots (Players must have IR or Out
								designation)
							</li>
						</ul>

						<h4 class="mt-4 text-lg font-semibold">Taxi Squad</h4>
						<ul class="list-inside list-disc space-y-1 pl-2">
							<li><span class="badge badge-outline">4</span> Taxi Spots (Rookies only)</li>
						</ul>
					</div>
				</div>

				<div class="collapse collapse-arrow bg-base-200 mt-2">
					<input type="checkbox" checked />
					<div class="collapse-title text-xl font-semibold">1.2 Trades</div>
					<div class="collapse-content">
						<p class="mt-2">
							Trading of all players and draft picks (up to 3 drafts away) is allowed. Trades will
							be processed ASAP after they are accepted. Trades can be vetoed by the commissioner if
							they are deemed to be collusion. Dumb/Bad trades where one manager is 'fleeced' will
							be allowed as long as there are not clear and obvious signs of collusion. Collusion
							will be deemed by the commissioner and co-commissioner(s) and no one else. People
							found guilty of collusion will be publicly shamed in the group chat and banned if
							there is a pattern of collusion.
						</p>

						<h4 class="mt-4 text-lg font-semibold">1.2.1 Trade Deadline</h4>
						<p class="mt-2">
							The trade deadline is the start of the first game of week 13. No trades will be
							allowed after this time.
						</p>
					</div>
				</div>

				<div class="collapse collapse-arrow bg-base-200 mt-2">
					<input type="checkbox" checked />
					<div class="collapse-title text-xl font-semibold">1.3 Waivers</div>
					<div class="collapse-content">
						<p class="mt-2">
							A FAAB waiver budget will be used for waivers. Each manager will have $1000 to spend,
							and no sleeper generated waiver suggestions will be provided. Waivers will be
							processed at 2 A.M. Wednesday morning every week. Players will be on waivers for 2
							days after they are dropped.
						</p>
					</div>
				</div>

				<a href="#" class="link link-hover mt-4 text-sm text-base-content/70">↑ Back to top</a>
			</div>
		</section>

		<!-- Section 2: Drafting -->
		<section id="drafting" class="card bg-base-100 mb-6 shadow-lg animate-fade-in-delay-3">
			<div class="card-body">
				<h2 class="card-title text-3xl font-bold">Section 2: Drafting</h2>

				<div class="collapse collapse-arrow bg-base-200 mt-4">
					<input type="checkbox" checked />
					<div class="collapse-title text-xl font-semibold">2.1 Rookie Drafts</div>
					<div class="collapse-content">
						<p class="mt-2">
							Each year after the NFL draft the rookie draft will be held. The rookie draft will be
							a 5 round linear draft. The draft order will be determined by the reverse order of the
							previous year's standings. The non-playoff teams will draft in the order of their
							standings, and the playoff teams will draft in the reverse order of their playoff
							standings. The rookie draft will be held on Sleeper and will be a slow draft, and each
							manager will have 8 hours to make their pick. If a manager does not make their pick in
							time, they will be auto-drafted the highest-ranked player available according to
							Sleeper.
						</p>
					</div>
				</div>

				<div class="collapse collapse-arrow bg-base-200 mt-2">
					<input type="checkbox" checked />
					<div class="collapse-title text-xl font-semibold">2.2 Startup Draft</div>
					<div class="collapse-content">
						<p class="mt-2">
							The startup draft will be a 29 round snake draft. The draft will be held on Sleeper
							and will be a slow draft, and each manager will have 8 hours to make their pick. If a
							manager does not make their pick in time, they will be auto-drafted the highest-ranked
							player available according to Sleeper. The draft order will be randomized before the
							start of the draft. The draft order will be reversed for the second round and so on.
						</p>
					</div>
				</div>

				<a href="#" class="link link-hover mt-4 text-sm text-base-content/70">↑ Back to top</a>
			</div>
		</section>

		<!-- Section 3: Scoring -->
		<section id="scoring" class="card bg-base-100 mb-6 shadow-lg animate-fade-in-delay-4">
			<div class="card-body">
				<h2 class="card-title text-3xl font-bold">Section 3: Scoring</h2>
				<p class="mt-2">
					The scoring system will be a PPR TEP scoring system. The scoring system is listed on
					Sleeper and is as follows:
				</p>

				<div class="collapse collapse-arrow bg-base-200 mt-4">
					<input type="checkbox" checked />
					<div class="collapse-title text-xl font-semibold">Passing</div>
					<div class="collapse-content">
						<ul class="list-inside list-disc space-y-1 pl-2">
							<li>Passing Yards: 1 point per 25 yards</li>
							<li>Passing Touchdowns: 4 points</li>
							<li>2 Point Conversions: 2 points</li>
							<li>Interceptions: -2 points</li>
						</ul>
					</div>
				</div>

				<div class="collapse collapse-arrow bg-base-200 mt-2">
					<input type="checkbox" checked />
					<div class="collapse-title text-xl font-semibold">Rushing</div>
					<div class="collapse-content">
						<ul class="list-inside list-disc space-y-1 pl-2">
							<li>Rushing Yards: 1 point per 10 yards</li>
							<li>Rushing Touchdowns: 6 points</li>
							<li>2 Point Conversions: 2 points</li>
							<li>Fumbles Lost: -2 points</li>
						</ul>
					</div>
				</div>

				<div class="collapse collapse-arrow bg-base-200 mt-2">
					<input type="checkbox" checked />
					<div class="collapse-title text-xl font-semibold">Receiving</div>
					<div class="collapse-content">
						<ul class="list-inside list-disc space-y-1 pl-2">
							<li>Receptions: 1 point</li>
							<li>Receiving Yards: 1 point per 10 yards</li>
							<li>Receiving Touchdowns: 6 points</li>
							<li>2 Point Conversions: 2 points</li>
							<li>Reception Bonus: 0.5 points for every reception by a tight end</li>
							<li>Fumbles Lost: -2 points</li>
						</ul>
					</div>
				</div>

				<div class="collapse collapse-arrow bg-base-200 mt-2">
					<input type="checkbox" checked />
					<div class="collapse-title text-xl font-semibold">Special Teams</div>
					<div class="collapse-content">
						<ul class="list-inside list-disc space-y-1 pl-2">
							<li>Special Teams Touchdowns (Kick/Punt Return): 6 points</li>
						</ul>
					</div>
				</div>

				<a href="#" class="link link-hover mt-4 text-sm text-base-content/70">↑ Back to top</a>
			</div>
		</section>

		<!-- Section 4: Postseason -->
		<section id="Postseason" class="card bg-base-100 mb-6 shadow-lg animate-fade-in-delay-5">
			<div class="card-body">
				<h2 class="card-title text-3xl font-bold">Section 4: Postseason</h2>

				<div class="collapse collapse-arrow bg-base-200 mt-4">
					<input type="checkbox" checked />
					<div class="collapse-title text-xl font-semibold">4.1 Playoff Format</div>
					<div class="collapse-content">
						<p class="mt-2">
							The playoffs will be a 6-team playoff format. The top 2 teams will get a bye in the
							first round. The playoffs will be held in weeks 14-17. The top 2 teams will play the
							lowest-seeded teams in the first round. The winners of those games will play the top 2
							teams in the championship game. The losers of those games will play each other for 3rd
							place.
						</p>
					</div>
				</div>

				<div class="collapse collapse-arrow bg-base-200 mt-2">
					<input type="checkbox" checked />
					<div class="collapse-title text-xl font-semibold">4.2 Playoff Seeding</div>
					<div class="collapse-content">
						<p class="mt-2">
							The playoff seeding will be determined by the order of the standings at the end of the
							regular season. Tiebreakers will determine seeding in the case of a tie and will be
							prioritized in the following order:
						</p>
						<ul class="steps steps-vertical mt-2">
							<li class="step step-primary">Points For</li>
							<li class="step step-primary">Points Against</li>
						</ul>
					</div>
				</div>

				<a href="#" class="link link-hover mt-4 text-sm text-base-content/70">↑ Back to top</a>
			</div>
		</section>

		<!-- Section 5: Tanking -->
		<section id="tanking" class="card bg-base-100 mb-6 shadow-lg animate-fade-in-delay-6">
			<div class="card-body">
				<h2 class="card-title text-3xl font-bold">Section 5: Tanking</h2>
				<p class="mt-2">
					Each manager must have a starting lineup without any out or injured players. A manager
					should put a good faith effort towards putting out a competitive lineup. If a manager
					wishes to tank, some good ways to do this are trading away good players to contending
					teams for future picks, as well as leaving rookies on the taxi squad for the year.
				</p>

				<a href="#" class="link link-hover mt-4 text-sm text-base-content/70">↑ Back to top</a>
			</div>
		</section>

		<!-- Section 6: Finances -->
		<section id="finances" class="card bg-base-100 mb-6 shadow-lg animate-fade-in-delay-7">
			<div class="card-body">
				<h2 class="card-title text-3xl font-bold">Section 6: Finances</h2>

				<div class="collapse collapse-arrow bg-base-200 mt-4">
					<input type="checkbox" checked />
					<div class="collapse-title text-xl font-semibold">6.1 League Fees</div>
					<div class="collapse-content">
						<p class="mt-2">The league buy-in will be $30 per team. The payout will be as follows:</p>
						<div class="mt-4 flex flex-wrap gap-4">
							<div class="stat bg-base-100 rounded-box shadow">
								<div class="stat-title">1st Place</div>
								<div class="stat-value text-success">$240</div>
								<div class="stat-desc">80% of pot</div>
							</div>
							<div class="stat bg-base-100 rounded-box shadow">
								<div class="stat-title">2nd Place</div>
								<div class="stat-value text-info">$60</div>
								<div class="stat-desc">20% of pot</div>
							</div>
						</div>
						<p class="mt-4 text-sm text-base-content/70">
							Note: This is to be paid to the managers who come in first and second in the playoffs,
							not the regular season.
						</p>
					</div>
				</div>

				<div class="collapse collapse-arrow bg-base-200 mt-2">
					<input type="checkbox" checked />
					<div class="collapse-title text-xl font-semibold">6.2 Money Management</div>
					<div class="collapse-content">
						<p class="mt-2">
							Dues will be paid to the commissioner before the start of each year, and then the
							commissioner will pay out the winners at the end of the year.
						</p>
					</div>
				</div>

				<a href="#" class="link link-hover mt-4 text-sm text-base-content/70">↑ Back to top</a>
			</div>
		</section>

		<!-- Section 7: League Rules -->
		<section id="rules" class="card bg-base-100 mb-6 shadow-lg animate-fade-in-delay-8">
			<div class="card-body">
				<h2 class="card-title text-3xl font-bold">Section 7: League Rules</h2>
				<p class="mt-2">
					Fantasy football is about fun, so let's all remember that and be respectful and have fun
					for many years to come.
				</p>

				<a href="#" class="link link-hover mt-4 text-sm text-base-content/70">↑ Back to top</a>
			</div>
		</section>
	</div>
</main>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fadeIn 0.5s ease-out forwards;
	}

	.animate-fade-in-delay-1 {
		animation: fadeIn 0.5s ease-out 0.1s forwards;
		opacity: 0;
	}

	.animate-fade-in-delay-2 {
		animation: fadeIn 0.5s ease-out 0.15s forwards;
		opacity: 0;
	}

	.animate-fade-in-delay-3 {
		animation: fadeIn 0.5s ease-out 0.2s forwards;
		opacity: 0;
	}

	.animate-fade-in-delay-4 {
		animation: fadeIn 0.5s ease-out 0.25s forwards;
		opacity: 0;
	}

	.animate-fade-in-delay-5 {
		animation: fadeIn 0.5s ease-out 0.3s forwards;
		opacity: 0;
	}

	.animate-fade-in-delay-6 {
		animation: fadeIn 0.5s ease-out 0.35s forwards;
		opacity: 0;
	}

	.animate-fade-in-delay-7 {
		animation: fadeIn 0.5s ease-out 0.4s forwards;
		opacity: 0;
	}

	.animate-fade-in-delay-8 {
		animation: fadeIn 0.5s ease-out 0.45s forwards;
		opacity: 0;
	}

	/* Ensure smooth scrolling for anchor links */
	:global(html) {
		scroll-behavior: smooth;
	}
</style>
