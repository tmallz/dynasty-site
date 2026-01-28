<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { themeChange } from 'theme-change';

	let checkbox: HTMLInputElement;

	let currentPath = $derived($page.url.pathname);

	function isActive(path: string): boolean {
		if (path === '/') {
			return currentPath === '/';
		}
		return currentPath === path || currentPath.startsWith(path + '/');
	}

	function isDropdownActive(paths: string[]): boolean {
		return paths.some((p) => isActive(p));
	}

	function closeDropdown(event: MouseEvent) {
		const target = event.currentTarget as HTMLElement;
		const details = target.closest('details');
		if (details) {
			details.removeAttribute('open');
		}
	}

	function closeMobileMenu() {
		const activeElement = document.activeElement as HTMLElement;
		activeElement?.blur();
	}

	onMount(() => {
		themeChange(false);
		// Sync checkbox state with actual theme from localStorage
		const savedTheme = localStorage.getItem('theme');
		if (checkbox) {
			checkbox.checked = savedTheme === 'light';
		}
	});
</script>

<nav class="navbar bg-base-100 shadow-lg w-full sticky top-0 z-50">
	<!-- Title -->
	<div class="flex-1">
		<a href="/" class="btn btn-ghost text-xl normal-case">League of Extraordinary Armchair GMs</a>
	</div>

	<!-- Desktop Menu -->
	<div class="hidden flex-none lg:flex">
		<ul class="menu menu-horizontal px-1">
			<li>
				<a
					href="/standings"
					class="hover:text-primary {isActive('/standings')
						? 'text-primary font-semibold border-b-2 border-primary'
						: ''}"
				>
					Standings
				</a>
			</li>
			<li>
				<a
					href="/rosters"
					class="hover:text-primary {isActive('/rosters')
						? 'text-primary font-semibold border-b-2 border-primary'
						: ''}"
				>
					Rosters
				</a>
			</li>
			<li>
				<a
					href="/matchups"
					class="hover:text-primary {isActive('/matchups')
						? 'text-primary font-semibold border-b-2 border-primary'
						: ''}"
				>
					Matchups
				</a>
			</li>
			<li>
				<a
					href="/transactions"
					class="hover:text-primary {isActive('/transactions')
						? 'text-primary font-semibold border-b-2 border-primary'
						: ''}"
				>
					Transactions
				</a>
			</li>
			<li>
				<a
					href="/drafts"
					class="hover:text-primary {isActive('/drafts')
						? 'text-primary font-semibold border-b-2 border-primary'
						: ''}"
				>
					Drafts
				</a>
			</li>

			<!-- Stats Dropdown -->
			<li>
				<details>
					<summary
						class="hover:text-primary {isDropdownActive(['/league-stats', '/rivalries'])
							? 'text-primary font-semibold'
							: ''}"
					>
						Stats
					</summary>
					<ul class="bg-base-100 rounded-box z-50 w-40 p-2 shadow-lg">
						<li>
							<a
								href="/league-stats"
								onclick={closeDropdown}
								class="hover:text-primary {isActive('/league-stats') ? 'text-primary font-semibold' : ''}"
							>
								League Stats
							</a>
						</li>
						<li>
							<a
								href="/rivalries"
								onclick={closeDropdown}
								class="hover:text-primary {isActive('/rivalries') ? 'text-primary font-semibold' : ''}"
							>
								Rivalries
							</a>
						</li>
					</ul>
				</details>
			</li>

			<!-- More Dropdown -->
			<li>
				<details>
					<summary
						class="hover:text-primary {isDropdownActive(['/resources', '/constitution'])
							? 'text-primary font-semibold'
							: ''}"
					>
						More
					</summary>
					<ul class="bg-base-100 rounded-box z-50 w-40 p-2 shadow-lg">
						<li>
							<a
								href="/resources"
								onclick={closeDropdown}
								class="hover:text-primary {isActive('/resources') ? 'text-primary font-semibold' : ''}"
							>
								Resources
							</a>
						</li>
						<li>
							<a
								href="/constitution"
								onclick={closeDropdown}
								class="hover:text-primary {isActive('/constitution') ? 'text-primary font-semibold' : ''}"
							>
								Constitution
							</a>
						</li>
					</ul>
				</details>
			</li>
		</ul>
	</div>

	<!-- Theme Switcher -->
	<div class="flex-none">
		<label class="swap swap-rotate">
			<!-- Hidden checkbox to toggle theme -->
			<input bind:this={checkbox} type="checkbox" data-toggle-theme="dark,light" data-act-class="ACTIVECLASS" />

			<!-- Sun Icon (show in dark mode - click to go light) -->
			<svg
				class="swap-off h-5 w-5 fill-current"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
			>
				<path
					d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"
				/>
			</svg>

			<!-- Moon Icon (show in light mode - click to go dark) -->
			<svg
				class="swap-on h-5 w-5 fill-current"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
			>
				<path
					d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"
				/>
			</svg>
		</label>
	</div>

	<!-- Mobile Menu -->
	<div class="dropdown dropdown-end lg:hidden">
		<div tabindex="0" role="button" class="btn btn-ghost btn-circle">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 6h16M4 12h16m-7 6h7"
				/>
			</svg>
		</div>
		<ul
			tabindex="0"
			role="menu"
			class="menu dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-56 p-2 shadow-lg"
		>
			<!-- Main Navigation -->
			<li>
				<a
					href="/standings"
					onclick={closeMobileMenu}
					class="py-3 {isActive('/standings') ? 'text-primary font-semibold bg-base-200' : ''}"
				>
					<span class="text-base">🏆</span> Standings
				</a>
			</li>
			<li>
				<a
					href="/rosters"
					onclick={closeMobileMenu}
					class="py-3 {isActive('/rosters') ? 'text-primary font-semibold bg-base-200' : ''}"
				>
					<span class="text-base">👥</span> Rosters
				</a>
			</li>
			<li>
				<a
					href="/matchups"
					onclick={closeMobileMenu}
					class="py-3 {isActive('/matchups') ? 'text-primary font-semibold bg-base-200' : ''}"
				>
					<span class="text-base">⚔️</span> Matchups
				</a>
			</li>
			<li>
				<a
					href="/transactions"
					onclick={closeMobileMenu}
					class="py-3 {isActive('/transactions') ? 'text-primary font-semibold bg-base-200' : ''}"
				>
					<span class="text-base">🔄</span> Transactions
				</a>
			</li>
			<li>
				<a
					href="/drafts"
					onclick={closeMobileMenu}
					class="py-3 {isActive('/drafts') ? 'text-primary font-semibold bg-base-200' : ''}"
				>
					<span class="text-base">📋</span> Drafts
				</a>
			</li>

			<li class="divider my-1"></li>

			<!-- Stats Section -->
			<li class="menu-title text-xs opacity-60 py-1">Stats</li>
			<li>
				<a
					href="/league-stats"
					onclick={closeMobileMenu}
					class="py-3 {isActive('/league-stats') ? 'text-primary font-semibold bg-base-200' : ''}"
				>
					<span class="text-base">📊</span> League Stats
				</a>
			</li>
			<li>
				<a
					href="/rivalries"
					onclick={closeMobileMenu}
					class="py-3 {isActive('/rivalries') ? 'text-primary font-semibold bg-base-200' : ''}"
				>
					<span class="text-base">🤝</span> Rivalries
				</a>
			</li>

			<li class="divider my-1"></li>

			<!-- More Section -->
			<li class="menu-title text-xs opacity-60 py-1">More</li>
			<li>
				<a
					href="/resources"
					onclick={closeMobileMenu}
					class="py-3 {isActive('/resources') ? 'text-primary font-semibold bg-base-200' : ''}"
				>
					<span class="text-base">🔗</span> Resources
				</a>
			</li>
			<li>
				<a
					href="/constitution"
					onclick={closeMobileMenu}
					class="py-3 {isActive('/constitution') ? 'text-primary font-semibold bg-base-200' : ''}"
				>
					<span class="text-base">📜</span> Constitution
				</a>
			</li>
		</ul>
	</div>
</nav>
