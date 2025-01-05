const apiKeyCurrents = 'b2uZWPY42BaUWN4Luaj_fbjJR6y7idTudew9UcpSbzr2D2VO';
const apiKeyNYT = 'NQdorI46QZM3Kythn8ymAWID8ojT7ntY';

document.addEventListener('DOMContentLoaded', function() {
  configureDropdowns();
  fetchNewsArticles();
  
  document.getElementById('toggleFilters').addEventListener('click', function() {
    const filterMenu = document.getElementById('filterMenu');
    $(filterMenu).collapse('toggle');
  });
});

document.getElementById('apiSelect').addEventListener('change', function() {
  configureDropdowns();
  fetchNewsArticles();
});

document.getElementById('searchButton').addEventListener('click', function() {
  fetchNewsArticles();
});

document.getElementById('resetButton').addEventListener('click', function() {
  document.getElementById('searchInput').value = '';
  document.getElementById('topicSelect').value = '';
  document.getElementById('apiSelect').value = 'currents';
  document.getElementById('sourceSelect').value = '';
  document.getElementById('languageSelect').value = '';
  document.getElementById('countrySelect').value = '';
  configureDropdowns();
  fetchNewsArticles();
});

function fetchTopics() {
  const url = `https://api.currentsapi.services/v1/available/categories?apiKey=${apiKeyCurrents}`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText} (${response.status})`);
      }
      return response.json();
    })
    .then(data => {
      const topicSelect = document.getElementById('topicSelect');
      topicSelect.innerHTML = '<option value="">All Topics</option>'; // Reset topics dropdown

      // Loop through the fetched categories from Currents API and add to the dropdown
      data.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category; // Assuming the category is used as an option value
        option.textContent = category; // Display the category name
        topicSelect.appendChild(option);
      });
    })
    .catch(error => console.error('Error fetching topics:', error));
}

function configureDropdowns() {
  const apiSelection = document.getElementById('apiSelect').value;
  const sourceSelectContainer = document.getElementById('sourceSelectContainer');
  const languageSelectContainer = document.getElementById('languageSelect').parentElement;
  const countrySelectContainer = document.getElementById('countrySelect').parentElement;

  if (apiSelection === 'currents') {
    sourceSelectContainer.style.display = 'block';
    languageSelectContainer.style.display = 'block';
    countrySelectContainer.style.display = 'block';

    fetchLanguages(); // Fetch and populate languages
    fetchCountries(); // Fetch and populate countries
    fetchTopics();    // Fetch and populate topics
  } else if (apiSelection === 'nyt') {
    sourceSelectContainer.style.display = 'none';
    languageSelectContainer.style.display = 'none';
    countrySelectContainer.style.display = 'none';
  }
}

// Fetch available languages from the Currents API
function fetchLanguages() {
  const url = `https://api.currentsapi.services/v1/available/languages?apiKey=${apiKeyCurrents}`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText} (${response.status})`);
      }
      return response.json();
    })
    .then(data => {
      const languageSelect = document.getElementById('languageSelect');
      languageSelect.innerHTML = '<option value="">All Languages</option>'; // Reset languages dropdown

      // Loop through the language object
      for (const [language, code] of Object.entries(data.languages)) {
        const option = document.createElement('option');
        option.value = code; // Set the value to the language code
        option.textContent = language; // Display the full language name
        languageSelect.appendChild(option);
      }
    })
    .catch(error => console.error('Error fetching languages:', error));
}

// Fetch available countries from the Currents API
function fetchCountries() {
  const url = `https://api.currentsapi.services/v1/available/regions?apiKey=${apiKeyCurrents}`; // New API link for regions

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText} (${response.status})`);
      }
      return response.json();
    })
    .then(data => {
      const countrySelect = document.getElementById('countrySelect');
      countrySelect.innerHTML = '<option value="">All Countries</option>'; // Reset countries dropdown

      // Loop through the regions object
      for (const [country, code] of Object.entries(data.regions)) {
        const option = document.createElement('option');
        option.value = code; // Set the value to the country code
        option.textContent = country; // Display the full country name
        countrySelect.appendChild(option);
      }
    })
    .catch(error => console.error('Error fetching countries:', error));
}

function fetchNewsArticles() {
  const query = document.getElementById('searchInput').value;
  const topic = document.getElementById('topicSelect').value;
  const apiSelection = document.getElementById('apiSelect').value;
  const language = document.getElementById('languageSelect').value;
  const region = document.getElementById('countrySelect').value; // Get selected region

  if (apiSelection === 'currents') {
    const source = document.getElementById('sourceSelect').value;
    fetchFromCurrentsAPI(query, source, topic, language, region); // Pass region filter
  } else if (apiSelection === 'nyt') {
    fetchFromNYTAPI(query, topic);
  }
}

// Fetch news articles from the Currents API
function fetchFromCurrentsAPI(query, source, topic, language, region) {
  let url = `https://api.currentsapi.services/v1/search?apiKey=${apiKeyCurrents}`;

  if (query) {
    url += `&keywords=${encodeURIComponent(query)}`;
  }
  if (source) {
    url += `&domain=${source}`;
  }
  if (topic) {
    url += `&category=${topic}`;
  }
  if (language) {
    url += `&language=${language}`;
  }
  if (region) {
    url += `&country=${region}`; // Add region to the query if selected
  }

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText} (${response.status})`);
      }
      return response.json();
    })
    .then(data => {
      if (data.news) {
        displayArticles(data.news, 'currents');
      } else {
        throw new Error('No articles found');
      }
    })
    .catch(error => console.error('Error fetching news:', error));
}

// Fetch news articles from the New York Times API
function fetchFromNYTAPI(query, topic) {
  let url = `https://api.nytimes.com/svc/search/v2/articlesearch.json?api-key=${apiKeyNYT}`;

  if (query) {
    url += `&q=${encodeURIComponent(query)}`;
  }
  if (topic) {
    url += `&fq=news_desk:("${topic}")`;
  }

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText} (${response.status})`);
      }
      return response.json();
    })
    .then(data => {
      if (data.response && data.response.docs) {
        displayArticles(data.response.docs.map(doc => ({
          title: doc.headline.main,
          description: doc.abstract,
          image: (doc.multimedia.length > 0) ? `https://nytimes.com/${doc.multimedia[0].url}` : 'default-thumbnail.jpg',
          content: doc.lead_paragraph,
          url: doc.web_url,
          published: doc.pub_date
        })), 'nyt');
      } else {
        throw new Error('No articles found');
      }
    })
    .catch(error => console.error('Error fetching news:', error));
}

function displayArticles(articles, apiType) { // Display articles
  const articlesDiv = document.getElementById('articles');
  articlesDiv.innerHTML = ''; // Clear previous articles

  const messageDiv = document.createElement('div'); // Create a message div

  if (articles.length === 0) {
    // Display an error message if there are no articles
    messageDiv.innerHTML = '<p class="text-danger">No articles found. Please try a different search.</p>';
    messageDiv.className = 'message';
    document.body.appendChild(messageDiv);
    setTimeout(() => { // Remove the message after 3 seconds
      document.body.removeChild(messageDiv);
    }, 3000);
    return;
  }

  articles.forEach(article => { // Loop through the articles
    const thumbnailUrl = article.image || 'default-thumbnail.jpg';

    const articleElement = document.createElement('div');
    articleElement.classList.add('card', 'mb-3', 'card-horizontal');
    let buttonHtml = '';

    if (apiType === 'currents') {
      buttonHtml = `<a href="${article.url}" target="_blank" class="btn btn-info">Read Full Article</a>`;
    } else if (apiType === 'nyt') {
      buttonHtml = `<button class="btn btn-info" onclick='viewArticleDetails(${JSON.stringify(article)})'>Read More</button>`;
    }

    articleElement.innerHTML = `
      <img src="${thumbnailUrl}" class="card-img-left" alt="Article thumbnail">
      <div class="card-body">
        <h5 class="card-title">${article.title}</h5>
        <p class="card-text">${article.description || 'No description available.'}</p>
        ${buttonHtml}
      </div>
    `;
    articlesDiv.appendChild(articleElement);
  });

  // Display success message
  messageDiv.innerHTML = '<p class="text-success">Articles loaded successfully!</p>';
  messageDiv.className = 'message';
  document.body.appendChild(messageDiv);

  // Automatically remove the message after a few seconds
  setTimeout(() => {
    document.body.removeChild(messageDiv);
  }, 3000);
}

// Function to view article details
function viewArticleDetails(article) {
  const articleDetailsModal = document.getElementById('articleDetails');
  const fullArticleLink = document.getElementById('fullArticleLink');

  const publishedDate = article.published
    ? new Date(article.published).toLocaleDateString()
    : 'Date not available';

  articleDetailsModal.innerHTML = `
    <h5>${article.title}</h5>
    <div class="article-metadata">
      Published: ${publishedDate}
    </div>
    <img src="${article.image}" alt="Article Image" class="img-fluid">
    <p>${article.content || 'No content available.'}</p>
  `;

  fullArticleLink.href = article.url || '#';
  fullArticleLink.style.display = article.url ? 'block' : 'none';

  $('#articleModal').modal('show');
}