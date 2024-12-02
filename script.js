document.addEventListener('DOMContentLoaded', function() {
  configureDropdowns();
  fetchNewsArticles();
});

document.getElementById('apiSelect').addEventListener('change', function() {
  configureDropdowns();
  fetchNewsArticles();
});

document.getElementById('searchButton').addEventListener('click', function() {
  fetchNewsArticles();
});

function configureDropdowns() {
  const apiSelection = document.getElementById('apiSelect').value;
  const sourceSelectContainer = document.getElementById('sourceSelectContainer');
  const languageSelectContainer = document.getElementById('languageSelect').parentElement;

  if (apiSelection === 'currents') {
    sourceSelectContainer.style.display = 'block';
    languageSelectContainer.style.display = 'block';
  } else if (apiSelection === 'nyt') {
    sourceSelectContainer.style.display = 'none';
    languageSelectContainer.style.display = 'none';
  }
}

function fetchNewsArticles() {
  const query = document.getElementById('searchInput').value;
  const topic = document.getElementById('topicSelect').value;
  const apiSelection = document.getElementById('apiSelect').value;
  const language = document.getElementById('languageSelect').value;

  if (apiSelection === 'currents') {
    const source = document.getElementById('sourceSelect').value;
    fetchFromCurrentsAPI(query, source, topic, language);
  } else if (apiSelection === 'nyt') {
    fetchFromNYTAPI(query, topic);
  }
}

function fetchFromCurrentsAPI(query, source, topic, language) {
  const apiKey = 'b2uZWPY42BaUWN4Luaj_fbjJR6y7idTudew9UcpSbzr2D2VO';
  let url = `https://api.currentsapi.services/v1/search?apiKey=${apiKey}`;

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

function fetchFromNYTAPI(query, topic) {
  const apiKey = 'NQdorI46QZM3Kythn8ymAWID8ojT7ntY';
  let url = `https://api.nytimes.com/svc/search/v2/articlesearch.json?api-key=${apiKey}`;

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

function displayArticles(articles, apiType) {
  const articlesDiv = document.getElementById('articles');
  articlesDiv.innerHTML = ''; // Clear previous articles

  const messageDiv = document.createElement('div'); // Create a message div

  if (articles.length === 0) {
    // Display an error message if there are no articles
    messageDiv.innerHTML = '<p class="text-danger">No articles found. Please try a different search.</p>';
    messageDiv.className = 'message';
    document.body.appendChild(messageDiv);
    setTimeout(() => {
      document.body.removeChild(messageDiv);
    }, 3000);
    return;
  }

  articles.forEach(article => {
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