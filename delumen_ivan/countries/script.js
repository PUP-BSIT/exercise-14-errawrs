let countryInput = document.querySelector("#country_input");
let countryDetails = document.querySelector("#country_details");
let regionCountries = document.querySelector("#region_countries");

const searchCountry = () => {
    const keyword = countryInput.value.trim();

    if (!keyword) {
        clearDisplay();

        const errorDiv = document.createElement("div");
        errorDiv.className = "error";
        errorDiv.textContent = "Error: Please enter a country name";

        countryDetails.appendChild(errorDiv);
        return;
    }

    fetch(`https://restcountries.com/v3.1/name/${keyword}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Country not found");
            }
            return response.json();
        })
        .then((data) => {
            const bestMatch = findBestMatch(data, keyword);
            countryInput.value = bestMatch.name.common;
            displayCountryDetails(bestMatch);

            return fetch(
                `https://restcountries.com/v3.1/region/${bestMatch.region}`
            );
        })
        .then((response) => response.json())
        .then((regionData) => {
            displayRegionCountries(regionData);
        })
        .catch((error) => {
            clearDisplay();

            const errorDiv = document.createElement("div");
            errorDiv.className = "error";
            errorDiv.textContent = `Error: ${error.message}`;

            countryDetails.appendChild(errorDiv);
        });
};

const clearDisplay = () => {
    countryDetails.innerHTML = "";
    regionCountries.innerHTML = "";
};

const findBestMatch = (countries, searchTerm) => {
    searchTerm = searchTerm.toLowerCase();

    const exactMatch = countries.find(
        (country) => country.name.common.toLowerCase() === searchTerm
    );
    if (exactMatch) return exactMatch;

    const startsWithMatch = countries.find((country) =>
        country.name.common.toLowerCase().startsWith(searchTerm)
    );
    if (startsWithMatch) return startsWithMatch;

    return countries[0];
};

const displayCountryDetails = (country) => {
    const name = country.name.common;
    const officialName = country.name.official;
    const capital = country.capital ? country.capital[0] : "N/A";
    const population = country.population.toLocaleString();
    const languages = country.languages
        ? Object.values(country.languages).join(", ")
        : "N/A";
    const currencies = country.currencies
        ? Object.values(country.currencies)
              .map((c) => `${c.name} (${c.symbol})`)
              .join(", ")
        : "N/A";
    const flagUrl = country.flags.png;
    const region = country.region;
    const subregion = country.subregion || "N/A";

    countryDetails.innerHTML = "";

    const heading = document.createElement("h2");
    heading.textContent = name;
    countryDetails.appendChild(heading);

    const countryInfo = document.createElement("div");
    countryInfo.className = "country-info";

    const flagImg = document.createElement("img");
    flagImg.src = flagUrl;
    flagImg.alt = `${name} flag`;
    flagImg.className = "country-flag";
    countryInfo.appendChild(flagImg);

    const countryData = document.createElement("div");
    countryData.className = "country-data";

    const createInfoItem = (label, value) => {
        const infoItem = document.createElement("div");
        infoItem.className = "info-item";

        const infoLabel = document.createElement("span");
        infoLabel.className = "info-label";
        infoLabel.textContent = `${label}:`;

        infoItem.appendChild(infoLabel);
        infoItem.appendChild(document.createTextNode(" " + value));

        return infoItem;
    };

    countryData.appendChild(createInfoItem("Official Name", officialName));
    countryData.appendChild(createInfoItem("Capital", capital));
    countryData.appendChild(createInfoItem("Region", region));
    countryData.appendChild(createInfoItem("Subregion", subregion));
    countryData.appendChild(createInfoItem("Population", population));
    countryData.appendChild(createInfoItem("Languages", languages));
    countryData.appendChild(createInfoItem("Currencies", currencies));

    countryInfo.appendChild(countryData);
    countryDetails.appendChild(countryInfo);
};

const displayRegionCountries = (countries) => {
    regionCountries.innerHTML = "";

    const regionHeader = document.createElement("div");
    regionHeader.className = "region-header";

    const regionTitle = document.createElement("h2");

    countries.sort((a, b) => a.name.common.localeCompare(b.name.common));

    const currentCountry = countryInput.value.trim().toLowerCase();

    const currentCountryData = countries.find(
        (c) => c.name.common.toLowerCase() === currentCountry.toLowerCase()
    );

    const filteredCountries = countries.filter(
        (country) =>
            country.name.common.toLowerCase() !== currentCountry.toLowerCase()
    );

    if (currentCountryData) {
        regionTitle.textContent = `Other Countries in 
            ${currentCountryData.region}`;
    } else {
        regionTitle.textContent = "Other Countries in Region";
    }

    regionHeader.appendChild(regionTitle);
    regionCountries.appendChild(regionHeader);

    const newRegionList = document.createElement("div");
    newRegionList.className = "region-list";
    regionCountries.appendChild(newRegionList);

    filteredCountries.forEach((country) => {
        const countryName = country.name.common;
        const flagUrl = country.flags.png;

        const countryElement = document.createElement("div");
        countryElement.className = "region-country";

        const flagImg = document.createElement("img");
        flagImg.src = flagUrl;
        flagImg.alt = `${countryName} flag`;
        flagImg.className = "region-flag";
        countryElement.appendChild(flagImg);

        const nameDiv = document.createElement("div");
        nameDiv.className = "region-name";
        nameDiv.textContent = countryName;
        countryElement.appendChild(nameDiv);

        countryElement.onclick = () => {
            countryInput.value = countryName;
            searchCountry();
        };

        newRegionList.appendChild(countryElement);
    });
};
