let nameInput = document.getElementById("name");
let commentTextarea = document.getElementById("comment");
let submitButton = document.getElementById("submit_button");
let commentContainer = document.getElementById("comment_container");
let selectOrder = document.getElementById("select_order");

function validateForm() {
  submitButton.disabled =
    !nameInput.value.trim() || !commentTextarea.value.trim();
}

function handleSubmit() {
  if (submitButton.disabled) return;
  let name = nameInput.value.trim();
  let comment = commentTextarea.value.trim();
  let timestamp = new Date().toLocaleString();

  createCommentBox(name, comment, timestamp);
  nameInput.value = "";
  commentTextarea.value = "";
  validateForm();
}

function createCommentBox(name, comment, timestamp) {
  let commentBox = document.createElement("div");
  commentBox.className = "comment-box";

  let commentParagraph = document.createElement("p");
  commentParagraph.className = "comment-text";
  commentParagraph.textContent = comment;

  let authorParagraph = document.createElement("p");
  authorParagraph.className = "author";
  authorParagraph.textContent = name;

  let timestampParagraph = document.createElement("p");
  timestampParagraph.className = "timestamp";
  timestampParagraph.textContent = `Timestamp: ${timestamp}`;

  commentBox.append(commentParagraph, authorParagraph, timestampParagraph);
  commentContainer.append(commentBox);
}

function sortComments() {
  if (selectOrder.value === "") {
    return;
  }

  let commentElements = Array.from(commentContainer.children);
  commentElements.sort((commentA, commentB) => {
    let timestampA = new Date(
      commentA.querySelector(".timestamp").textContent.split(": ")[1]
    );
    let timestampB = new Date(
      commentB.querySelector(".timestamp").textContent.split(": ")[1]
    );
    return selectOrder.value === "ascending"
      ? timestampA - timestampB
      : timestampB - timestampA;
  });
  commentContainer.innerHTML = "";
  commentElements.forEach((comment) => commentContainer.append(comment));
}

function handleSearchKeyPress(event) {
  if (event.key !== "Enter") {
    return;
  }
  searchCountry();
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

  fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`
  )
      .then(handleResponse)
      .then(handleCountryData)
      .catch(handleError);
}

function handleResponse(response) {
  if (!response.ok) {
    throw new Error(`Status: ${response.status}`);
  }

  return response.json();
}

function handleCountryData(data) {
  if (!data.length) {
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
    return null;
  }

  return fetch(
    `https://restcountries.com/v3.1/region/${encodeURIComponent(region)}`
  )
    .then(handleResponse)
    .then((regionData) => {
      if (regionData && regionData.length) {
        const region = document.getElementById("country_region").textContent;
        displayRegionCountries(region, regionData);
      }
      hideLoading();
    });
}

function handleError(error) {
  console.error("Error fetching data:", error);
  showError(
    "Country not found or service unavailable. Please try again later."
  );
  hideLoading();
}

function matchCountry(countries, searchTerm) {
  const searchLower = searchTerm.toLowerCase();
  const scoredCountries = countries.map((country) => {
    const name = country.name.common.toLowerCase();
    let score = 0;

    if (name === searchLower) {
      score += 100;
    }

    if (name.startsWith(searchLower)) {
      score += 50;
    }

    if (name.includes(" " + searchLower) || name.includes(searchLower + " ")) {
      score += 25;
    }

    if (name.includes(searchLower)) {
      score += 10;
    }

    if (country.altSpellings) {
      for (const alt of country.altSpellings) {
        if (alt.toLowerCase() === searchLower) {
          score += 40;
          break;
        }

        if (alt.toLowerCase().startsWith(searchLower)) {
          score += 20;
          break;
        }
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

function displayCountryDetails(country) {
  const countryDetails = document.getElementById("country_details");
  document.getElementById("country_flag").src = country.flags.png || "";
  document.getElementById("country_name").textContent =
      country.name.common || "";

  let nativeName = "";
  if (country.name.nativeName) {
    const nativeNameKeys = Object.keys(country.name.nativeName);
    if (nativeNameKeys.length) {
      nativeName = country.name.nativeName[nativeNameKeys[0]].common || "";
    }
  }
  document.getElementById("country_native_name").textContent = nativeName;
  document.getElementById("country_capital").textContent =
      (country.capital && country.capital[0]) || "N/A";
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
    const currencyKeys = Object.keys(country.currencies);
    if (currencyKeys.length) {
      const currObj = country.currencies[currencyKeys[0]];
      currency = `${currObj.name} (${currObj.symbol || ""})`;
    }
  }
  document.getElementById("country_currency").textContent = currency;
  countryDetails.style.display = "block";
}

function displayRegionCountries(region, countries) {
  const regionContainer = document.getElementById("region_container");
  const regionTitle = document.getElementById("region_title");
  const regionCountries = document.getElementById("region_countries");

  regionTitle.textContent = `Other Countries in ${region}`;
  regionCountries.innerHTML = "";

  const currentCountryName =
      document.getElementById("country_name").textContent;
  const otherCountries = countries.filter(
    (country) => country.name.common !== currentCountryName
  );

  otherCountries.slice(0, 8).forEach((country) => {
    const card = createCountryCard(country);
    regionCountries.appendChild(card);
  });

  regionContainer.style.display = "block";
}

function createCountryCard(country) {
  const card = document.createElement("div");
  card.className = "region-country-card";
  card.onclick = () => handleCountryCardClick(country.name.common);

  // Create flag image
  const flagImg = document.createElement("img");
  flagImg.className = "region-country-flag";
  flagImg.src = country.flags.png;
  flagImg.alt = country.name.common + " flag";
  card.appendChild(flagImg);

  // Create info container
  const infoDiv = document.createElement("div");
  infoDiv.className = "region-country-info";

  // Create country name element
  const nameDiv = document.createElement("div");
  nameDiv.className = "region-country-name";
  nameDiv.textContent = country.name.common;
  infoDiv.appendChild(nameDiv);

  // Create capital element
  const capitalDiv = document.createElement("div");
  capitalDiv.className = "region-country-capital";
  capitalDiv.textContent = (country.capital && country.capital[0]) || "N/A";
  infoDiv.appendChild(capitalDiv);

  card.appendChild(infoDiv);
  return card;
}

function handleCountryCardClick(countryName) {
  document.getElementById("country_search").value = countryName;
  searchCountry();
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function showLoading() {
  document.getElementById("loading").style.display = "block";
  document.getElementById("country_details").style.display = "none";
  document.getElementById("region_container").style.display = "none";
}

function hideLoading() {
  document.getElementById("loading").style.display = "none";
}

function showError(message) {
  const errorEl = document.getElementById("error");
  errorEl.textContent = message;
  errorEl.style.display = "block";
}

function clearError() {
  const errorEl = document.getElementById("error");
  errorEl.textContent = "";
  errorEl.style.display = "none";
}
