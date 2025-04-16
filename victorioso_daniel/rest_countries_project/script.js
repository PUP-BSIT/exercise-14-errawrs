let allCountriesInRegion = [];
let currentPage = 0;
const countriesPerPage = 10;

document.addEventListener(
	"DOMContentLoaded",
	(handleEnterKey = () => {
		const inputField = document.querySelector("#search_bar");
		if (inputField) {
			inputField.addEventListener("keypress", (event) => {
				if (event.key === "Enter") {
					getCountry();
					inputField.value = "";
				}
			});
		}
	})
);

function showResults() {
	document.querySelector(".container").classList.add("results-shown");
}

function getCountry() {
	const searchBar = document.querySelector("#search_bar");
	const keyword = searchBar.value.toLowerCase();

	if (!keyword.trim()) {
		displayOutput(
			`<p class="error-message">Error: Please enter a country name.</p>`
		);
		showResults();
		return;
	}

	displayOutput(`<p>Loading country information...</p>`);
	showResults();
	searchBar.value = "";

	fetch(`https://restcountries.com/v3.1/name/${keyword}`)
		.then((response) => {
			if (!response.ok) throw new Error("No country found.");
			return response.json();
		})
		.then((jsonArray) => exactMatch(jsonArray, keyword))
		.catch((error) => {
			displayOutput(
				`<p class="error-message">Error: ${error.message}</p>`
			);
		});
}

function exactMatch(jsonArray, keyword) {
	const match = jsonArray.find(
		(country) => country.name.common.toLowerCase() === keyword
	);

	return match ? showCountry(match) : containsMatch(jsonArray, keyword);
}

function containsMatch(jsonArray, keyword) {
	const match = jsonArray.find((country) =>
		country.name.common.toLowerCase().includes(keyword)
	);

	return match ? showCountry(match) : mostLikely(jsonArray);
}

function mostLikely(jsonArray) {
	const match = jsonArray[0];
	match && showCountry(match);
}

function showCountry(match) {
	currentPage = 0;
	allCountriesInRegion = [];

	const region = match.region;
	const officialName = match.name.official;
	const commonName = match.name.common;
	const capitalCity = match.capital ? match.capital[0] : "N/A";
	const population = match.population.toLocaleString();
	const currency = Object.values(match.currencies)[0];
	const currencyName = currency.name;
	const currencySymbol = currency.symbol;
	const languageList = Object.values(match.languages).join(", ");
	const flag = match.flags.png;

	const container = document.querySelector(".country-output");
	container.innerHTML = "";

	const h2 = document.createElement("h2");
	h2.classList.add("country-name");
	h2.textContent = `${commonName}`;

	const img = document.createElement("img");
	img.classList.add("country-flag");
	img.src = flag;
	img.alt = `Flag of ${commonName}`;

	const ul = document.createElement("ul");
	ul.classList.add("country-details");

	const official = document.createElement("li");
	official.textContent = `Official Name: ${officialName}`;

	const capitalLi = document.createElement("li");
	capitalLi.textContent = `Capital: ${capitalCity}`;

	const regionLi = document.createElement("li");
	regionLi.textContent = `Region: ${region}`;

	const populationLi = document.createElement("li");
	populationLi.textContent = `Population: ${population}`;

	const currencyLi = document.createElement("li");
	currencyLi.textContent = `Currency: ${currencyName} (${currencySymbol})`;

	const languagesLi = document.createElement("li");
	languagesLi.textContent = `Languages: ${languageList}`;

	ul.appendChild(official);
	ul.appendChild(capitalLi);
	ul.appendChild(regionLi);
	ul.appendChild(populationLi);
	ul.appendChild(currencyLi);
	ul.appendChild(languagesLi);

	container.appendChild(h2);
	container.appendChild(img);
	container.appendChild(ul);

	const loadingP = document.createElement("p");
	loadingP.textContent = `Loading...`;
	container.appendChild(loadingP);

	fetch(`https://restcountries.com/v3.1/region/${region}`)
		.then((res) => res.json())
		.then((regionCountries) => {
			container.removeChild(loadingP);

			allCountriesInRegion = regionCountries.filter(
				(country) => country.name.common !== commonName
			);

			if (allCountriesInRegion.length) {
				const h3 = document.createElement("h3");
				h3.textContent = `Other countries in ${region}:`;
				container.appendChild(h3);

				const listContainer = document.createElement("div");
				listContainer.id = "countries-list-container";
				container.appendChild(listContainer);

				return showCountriesPage();
			}

			const p = document.createElement("p");
			p.textContent = "No other countries found in the same region.";
			container.appendChild(p);
		})
		.catch((error) => {
			const errorIntro = "Error fetching region countries:";

			container.removeChild(loadingP);

			const errorP = document.createElement("p");
			errorP.classList.add("error-message");
			errorP.textContent = `${errorIntro} ${error.message}`;
			container.appendChild(errorP);
		});
}

function showCountriesPage() {
	const container = document.querySelector("#countries-list-container");

	container.innerHTML = "";

	const startIndex = currentPage * countriesPerPage;
	const endIndex = Math.min(
		startIndex + countriesPerPage,
		allCountriesInRegion.length
	);

	const countriesOnPage = allCountriesInRegion.slice(startIndex, endIndex);

	const otherCountriesList = document.createElement("ul");
	otherCountriesList.classList.add("other-countries-list");

	countriesOnPage.forEach((country) => {
		const li = document.createElement("li");
		li.classList.add("other-country");
		li.addEventListener("click", () => {
			document.querySelector("#search_bar").value = country.name.common;
			getCountry();
		});

		const flagImg = document.createElement("img");
		flagImg.classList.add("other-country-flag");
		flagImg.src = country.flags.png;
		flagImg.alt = `Flag of ${country.name.common}`;
		li.appendChild(flagImg);

		const countryName = document.createElement("p");
		countryName.classList.add("other-country-name");
		countryName.textContent = country.name.common;
		li.appendChild(countryName);

		otherCountriesList.appendChild(li);
	});

	container.appendChild(otherCountriesList);

	addPaginationControls(container);
}

function addPaginationControls(container) {
	const totalPages = Math.ceil(
		allCountriesInRegion.length / countriesPerPage
	);

	if (totalPages <= 1) return;

	const paginationDiv = document.createElement("div");
	paginationDiv.classList.add("pagination-controls");

	const prevButton = document.createElement("button");
	prevButton.classList.add("pagination-button");
	prevButton.textContent = "Previous";
	prevButton.disabled = currentPage === 0;
	prevButton.addEventListener("click", () => {
		if (currentPage > 0) {
			currentPage--;
			showCountriesPage();
		}
	});

	const pageInfo = document.createElement("span");
	pageInfo.classList.add("pagination-info");
	pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages}`;

	const nextButton = document.createElement("button");
	nextButton.classList.add("pagination-button");
	nextButton.textContent = "Next";
	nextButton.disabled = currentPage >= totalPages - 1;
	nextButton.addEventListener("click", () => {
		if (currentPage < totalPages - 1) {
			currentPage++;
			showCountriesPage();
		}
	});

	paginationDiv.appendChild(prevButton);
	paginationDiv.appendChild(pageInfo);
	paginationDiv.appendChild(nextButton);

	container.appendChild(paginationDiv);
}

function displayOutput(html) {
	const container = document.querySelector(".country-output");
	container.innerHTML = html;
}