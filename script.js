/*
 * JavaScript Boilerplate for News Aggregator Project
 * 
 * This JavaScript file is part of the Web APIs assignment.
 * Your task is to complete the functions with appropriate module pattern, observer pattern, singleton pattern.
 * 
 * Follow the TODO prompts and complete each section to ensure the
 * News Aggregator App works as expected.
 */

// Singleton Pattern: ConfigManager
const ConfigManager = (function() {
    let instance;

    function createInstance() {
        return {
            theme: 'dark',
            apiUrl: 'https://newsapi.org/v2/top-headlines',
            apiKey: '6c65445cbe274d0ab8a833fcdec68831', // ✅ Replaced with your API key
            country: 'us'
        };
    }

    // Return getInstance function
    return {
        getInstance: function() {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

// Module Pattern: NewsFetcher
const NewsFetcher = (function () {
    const config = ConfigManager.getInstance();

    // Using async/await with a CORS proxy for GitHub Pages compatibility
    async function fetchArticles() {
        try {
            const proxyUrl = 'https://api.allorigins.win/get?url=';
            const targetUrl = `${config.apiUrl}?country=${config.country}&apiKey=${config.apiKey}`;
            const response = await fetch(`${proxyUrl}${encodeURIComponent(targetUrl)}`);

            if (!response.ok) {
                throw new Error('Failed to fetch articles');
            }

            // Parse proxy response
            const proxyData = await response.json();
            const data = JSON.parse(proxyData.contents);

            // Return articles safely
            return data.articles || [];
        } catch (error) {
            console.error('Error fetching news:', error);
            return [];
        }
    }

    return {
        getArticles: fetchArticles
    };
})();

// Observer Pattern: NewsFeed
function NewsFeed() {
    this.observers = [];
    this.articles = [];
}

NewsFeed.prototype = {
    subscribe: function(fn) {
        this.observers.push(fn);
    },
    unsubscribe: function(fn) {
        this.observers = this.observers.filter(observer => observer !== fn);
    },
    notify: function(article) {
        this.observers.forEach(observer => observer(article));
    },
    addArticle: function(article) {
        this.articles.push(article);
        this.notify(article);
    }
};

// Instantiate the NewsFeed
const newsFeed = new NewsFeed();

// Observer 1: Update Headline
function updateHeadline(article) {
    const headlineElement = document.getElementById('headline').querySelector('p');
    headlineElement.textContent = article.title;
}

// Observer 2: Update Article List
function updateArticleList(article) {
    const articleListElement = document.getElementById('articles');
    const listItem = document.createElement('li');
    listItem.textContent = article.title;
    articleListElement.appendChild(listItem);
}

// Subscribe Observers
newsFeed.subscribe(updateHeadline);
newsFeed.subscribe(updateArticleList);

// Fetch and display articles
NewsFetcher.getArticles().then(articles => {
    articles.forEach(article => {
        newsFeed.addArticle(article);
    });
});

// Display Config Info
const configInfo = ConfigManager.getInstance();
document.getElementById('configInfo').textContent = `Theme: ${configInfo.theme}`;
