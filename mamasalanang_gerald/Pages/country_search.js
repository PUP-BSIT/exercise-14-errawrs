document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('country-search');
    const searchButton = document.getElementById('search-button');
    const countryDetails = document.getElementById('country-details');
    const regionCountries = document.getElementById('region-countries');
    const errorMessage = document.getElementById('error-message');

    const countryFlag = document.getElementById('country-flag');
    const countryName = document.getElementById('country-name');
    const countryCapital = document.getElementById('country-capital');
    const countryRegion = document.getElementById('country-region');
    const countryPopulation = document.getElementById('country-population');
    const countryLanguages = document.getElementById('country-languages');
    const countryCurrency = document.getElementById('country-currency');
 
    const countriesGrid = document.getElementById('countries-grid');
    
    searchButton.addEventListener('click', searchCountry);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchCountry();
        }
    });
    
    function searchCountry() {
        const searchTerm = searchInput.value.trim();
        
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
        
        const languages = country.languages ? 
              Object.values(country.languages).join(', ') : 'N/A';
        countryLanguages.textContent = languages;
        
        let currencyText = 'N/A';
        if (country.currencies) {
            const currencyEntries = Object.entries(country.currencies);
            if (currencyEntries.length > 0) {
                const [code, details] = currencyEntries[0];
                currencyText = `${details.name} (${details.symbol || code})`;
            }
        }
        countryCurrency.textContent = currencyText;
        
        countryDetails.style.display = 'block';
    }
    
    function displayRegionCountries(countries) {
        countriesGrid.innerHTML = '';
        
        countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
        
        countries.forEach(country => {
            if (country.name.common === countryName.textContent) {
                return;
            }
            
            const countryCard = document.createElement('div');
            countryCard.className = 'country-card';
            
            const flagImg = document.createElement('img');
            flagImg.src = country.flags.png;
            flagImg.alt = country.flags.alt || 
                  `Flag of ${country.name.common}`;
            
            const nameElement = document.createElement('h4');
            nameElement.textContent = country.name.common;
            
            const populationElement = document.createElement('p');
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
        
        regionCountries.style.display = 'block';
    }
    
    function formatNumber(num) {
        return num.toLocaleString();
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        countryDetails.style.display = 'none';
        regionCountries.style.display = 'none';
    }
    
    function resetDisplay() {
        errorMessage.style.display = 'none';
        countryDetails.style.display = 'none';
        regionCountries.style.display = 'none';
    }
});