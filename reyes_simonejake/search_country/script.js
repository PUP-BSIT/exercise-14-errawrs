let paginatedCountries = [];
let currentPage = 1;
const countriesPerPage = 8;

function handleSearchKeyPress(event) {
	if (event.key === "Enter") {
		searchCountry();
	}
}

function searchCountry() {
	const searchInput = document.getElementById("country_search");
	const countryName = searchInput.value.trim();

	if (!countryName) {
		showError("Please enter a country name");
		return;
	}
	showLoading();
	clearError();
	fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`)
		.then((response) => {
			if (response.ok) return response.json();
			return fetch(
				`https://restcountries.com/v3.1/name/${countryName}`
			).then((res) => {
				if (!res.ok) throw new Error(`Status: ${res.status}`);
				return res.json();
			});
		})
		.then(handleCountryData)
		.catch((error) => {
			console.error("Error fetching data:", error);
			const capitalizedName =
			      countryName.charAt(0).toUpperCase() + countryName.slice(1);
			if (capitalizedName !== countryName) {
				fetch(`https://restcountries.com/v3.1/name/${capitalizedName}`)
					.then((res) => {
						if (!res.ok) throw new Error(`Status: ${res.status}`);
						return res.json();
					})
					.then(handleCountryData)
					.catch(handleError);
			} else {
				handleError(error);
			}
		});
}

function matchCountry(countries, searchTerm) {
	const searchLower = searchTerm.toLowerCase();
	const scoredCountries = countries.map((country) => {
		const name = country.name.common.toLowerCase();
		let score = 0;

		if (name === searchLower) score += 100;
		if (name.startsWith(searchLower)) score += 50;
		if (
            name.includes(" " + searchLower) ||
              name.includes(searchLower + " ")
		)
			score += 25;
		if (name.includes(searchLower)) score += 10;

		if (country.altSpellings) {
			for (const alt of country.altSpellings) {
				const altLower = alt.toLowerCase();
				if (altLower === searchLower) score += 40;
				else if (altLower.startsWith(searchLower)) score += 20;
			}
		}

		if (
			country.capital &&
			country.capital[0] &&
			country.capital[0].toLowerCase().includes(searchLower)
		) {
			score += 15;
		}

		return { country, score };
	});

	scoredCountries.sort((a, b) => b.score - a.score);
	return scoredCountries[0].country;
}

function handleCountryData(data) {
	if (!data || !data.length) {
		showError("No country found with that name");
		hideLoading();
		return;
	}

	const searchTerm = document.getElementById("country_search").value.trim();
	const country = matchCountry(data, searchTerm);
	displayCountryDetails(country);

	const region = country.region;
	if (!region) {
		hideLoading();
		return;
	}

	fetch(`https://restcountries.com/v3.1/region/${region}`)
		.then((res) => res.json())
		.then((regionData) => {
			displayRegionCountries(region, regionData, country.name.common);
			hideLoading();
		})
		.catch(handleError);
}

function displayCountryDetails(country) {
	document.getElementById("country_flag").src = country.flags.png || "";
	document.getElementById("country_name").textContent =
	      country.name.common || "";
	document.getElementById(
		"country_flag"
	).alt = `${country.name.common} flag`;

	let nativeName = "";
	if (country.name.nativeName) {
		const keys = Object.keys(country.name.nativeName);
		nativeName = country.name.nativeName[keys[0]].common || "";
	}
	document.getElementById("country_native_name").textContent = nativeName;
	document.getElementById("country_capital").textContent =
	      country.capital?.[0] || "N/A";
	document.getElementById("country_region").textContent =
	      country.region || "N/A";
	document.getElementById("country_population").textContent =
		  formatNumber(country.population) || "N/A";

	let languages = "N/A";
	if (country.languages) {
		languages = Object.values(country.languages).join(", ");
	}
	document.getElementById("country_languages").textContent = languages;

	let currency = "N/A";
	if (country.currencies) {
		const keys = Object.keys(country.currencies);
		const curr = country.currencies[keys[0]];
		currency = `${curr.name} (${curr.symbol || ""})`;
	}
	document.getElementById("country_currency").textContent = currency;
	document.getElementById("country_details").classList.add("visible");
}

function displayRegionCountries(region, countries, currentCountryName) {
	const regionTitle = document.getElementById("region_title");
	const regionContainer = document.getElementById("region_container");
	regionTitle.textContent = `Other Countries in ${region}`;
	regionContainer.classList.add("visible");

	paginatedCountries = countries
		.filter((c) => c.name.common !== currentCountryName)
		.sort((a, b) => a.name.common.localeCompare(b.name.common));
	currentPage = 1;
	renderRegionPage(region);
}

function renderRegionPage(region) {
	const regionCountries = document.getElementById("region_countries");
	const pageInfo = document.getElementById("page_info");
	const prevBtn = document.getElementById("prev_page");
	const nextBtn = document.getElementById("next_page");

	regionCountries.innerHTML = "";
	const start = (currentPage - 1) * countriesPerPage;
	const end = start + countriesPerPage;
	const pageCountries = paginatedCountries.slice(start, end);

	pageCountries.forEach((country) => {
		const card = createCountryCard(country);
		regionCountries.appendChild(card);
	});

	const totalPages = Math.ceil(paginatedCountries.length / countriesPerPage);
	pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
	prevBtn.disabled = currentPage === 1;
	nextBtn.disabled = currentPage === totalPages;

	prevBtn.onclick = () => {
		if (currentPage > 1) {
			currentPage--;
			renderRegionPage(region);
		}
	};
	nextBtn.onclick = () => {
		if (currentPage < totalPages) {
			currentPage++;
			renderRegionPage(region);
		}
	};
}

function createCountryCard(country) {
	const card = document.createElement("div");
	card.className = "region-country-card";
	card.onclick = () => handleCountryCardClick(country.name.common);

	const flagImg = document.createElement("img");
	flagImg.className = "region-country-flag";
	flagImg.src = country.flags.png;
	flagImg.alt = country.name.common + " flag";
	card.appendChild(flagImg);

	const infoDiv = document.createElement("div");
	infoDiv.className = "region-country-info";

	const nameDiv = document.createElement("div");
	nameDiv.className = "region-country-name";
	nameDiv.textContent = country.name.common;
	infoDiv.appendChild(nameDiv);

	const capitalDiv = document.createElement("div");
	capitalDiv.className = "region-country-capital";
	capitalDiv.textContent = (country.capital && country.capital[0]) || "N/A";
	infoDiv.appendChild(capitalDiv);

	const populationDiv = document.createElement("div");
	populationDiv.className = "region-country-population";
	populationDiv.textContent = `Pop: ${formatNumber(country.population)}`;
	infoDiv.appendChild(populationDiv);

	card.appendChild(infoDiv);
	return card;
}

function handleCountryCardClick(name) {
	document.getElementById("country_search").value = name;
	searchCountry();
	window.scrollTo({ top: 0, behavior: "smooth" });
}

function formatNumber(num) {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function showLoading() {
	const loading = document.getElementById("loading");
	loading.classList.add("visible");
	document.getElementById("country_details").classList.remove("visible");
	document.getElementById("region_container").classList.remove("visible");
}

function hideLoading() {
	const loading = document.getElementById("loading");
	loading.classList.remove("visible");
}

function showError(message) {
	const error = document.getElementById("error");
	error.textContent = message;
	error.classList.add("visible");
}

function clearError() {
	const error = document.getElementById("error");
	error.textContent = "";
	error.classList.remove("visible");
}

function handleError(error) {
	console.error("Error:", error);
	showError("Country not found. Please try another search.");
	hideLoading();
}
