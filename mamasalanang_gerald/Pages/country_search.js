document.addEventListener('DOMContentLoaded', () => {
    searchInput = document.getElementById('country_search');
    searchButton = document.getElementById('search_button');
    countryDetails = document.getElementById('country_details');
    regionCountries = document.getElementById('region_countries');
    errorMessage = document.getElementById('error_message');

    countryFlag = document.getElementById('country_flag');
    countryName = document.getElementById('country_name');
    countryCapital = document.getElementById('country_capital');
    countryRegion = document.getElementById('country_region');
    countryPopulation = document.getElementById('country_population');
    countryLanguages = document.getElementById('country_languages');
    countryCurrency = document.getElementById('country_currency');
 
    countriesGrid = document.getElementById('countries_grid');
    
    searchButton.addEventListener('click', searchCountry);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchCountry();
        }
    });
});
    
function searchCountry() {
    let searchTerm = searchInput.value.trim();
        
    if (!searchTerm) {
        showError('Please enter a country name');
        return;
    }
        
    resetDisplay();
        
    fetchCountryByName(searchTerm)
        .catch(() => {
            if (searchTerm.length <= 3) {
                return fetchCountryByCode(searchTerm);
            }
            throw new Error('Country not found');
        })
        .then(country => {
            displayCountryDetails(country);
            return fetchRegionCountries(country.region);
        })
        .then(regionData => {
            displayRegionCountries(regionData);
        })
        .catch(error => {
            showError(error.message || 'Failed to fetch country data');
        });
}
    
function fetchCountryByName(countryName) {
    return fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Country not found');
            }
            return response.json();
            })
            .then(data => {
            if (data.length === 0) {
                throw new Error('No results found');
            }
            return data[0];
        });
}
    
function fetchCountryByCode(code) {
    return fetch(`https://restcountries.com/v3.1/alpha/${code}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Country not found');
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                return data[0];
            }
            return data;
        });
}
    
function fetchRegionCountries(region) {
    return fetch(`https://restcountries.com/v3.1/region/${region}`)
        .then(response => response.json());
}
    
function displayCountryDetails(country) {
    countryFlag.src = country.flags.png;
    countryFlag.alt = country.flags.alt
          || `Flag of ${country.name.common}`;
        
    countryName.textContent = country.name.common;
        
    countryCapital.textContent =
          country.capital ? country.capital.join(', ') : 'N/A';
        
    countryRegion.textContent =
          `${country.region} (${country.subregion || ''})`;
        
    countryPopulation.textContent = formatNumber(country.population);
        
    let languages = country.languages ?
          Object.values(country.languages).join(', ') : 'N/A';
    countryLanguages.textContent = languages;
        
    let currencyText = 'N/A';
    if (country.currencies) {
        let currencyEntries = Object.entries(country.currencies);
        if (currencyEntries.length > 0) {
            let [code, details] = currencyEntries[0];
            currencyText = `${details.name} (${details.symbol || code})`;
        }
    }
    countryCurrency.textContent = currencyText;
        
    countryDetails.hidden = false;
}
    
function displayRegionCountries(countries) {
    countriesGrid.innerHTML = '';
        
    countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
        
    countries.forEach(country => {
        if (country.name.common === countryName.textContent) {
            return;
        }
            
        let countryCard = document.createElement('div');
        countryCard.className = 'country-card';
            
        let flagImg = document.createElement('img');
        flagImg.src = country.flags.png;
        flagImg.alt = country.flags.alt ||
              `Flag of ${country.name.common}`;
            
        let nameElement = document.createElement('h4');
        nameElement.textContent = country.name.common;
            
        let populationElement = document.createElement('p');
        populationElement.textContent =
              `Pop: ${formatNumber(country.population)}`;
            
        countryCard.appendChild(flagImg);
        countryCard.appendChild(nameElement);
        countryCard.appendChild(populationElement);
            
        countryCard.addEventListener('click', () => {
            searchInput.value = country.name.common;
            searchCountry();
        });
            
        countriesGrid.appendChild(countryCard);
    });
        
    regionCountries.hidden = false;
}
    
function formatNumber(num) {
    return num.toLocaleString();
}
    
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
    countryDetails.hidden = true;
    regionCountries.hidden = true;
}
    
function resetDisplay() {
    errorMessage.hidden = true;
    countryDetails.hidden = true;
    regionCountries.hidden = true;
}