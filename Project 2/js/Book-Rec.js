// JavaScript Document
 
    /* ---------------------------------------------
       FUNCTION: getRandomFunQuery
       Returns a search query built from two random "fun" keywords,
       plus additional random letters for extra variability.
    --------------------------------------------- */
    function getRandomFunQuery() {
      const funKeywords = [
        "fun", 
        "lighthearted", 
        "comedy", 
        "silly", 
        "quirky", 
        "whimsical", 
        "playful", 
        "happy", 
        "imaginative", 
        "adventure", 
        "mystery", 
        "fantasy", 
        "space", 
        "ocean"
      ];
      
      // Shuffle the keywords and pick two.
      const shuffledKeywords = funKeywords.sort(() => Math.random() - 0.5);
      const selectedKeywords = shuffledKeywords.slice(0, 2);
      const randomLetters = Math.random().toString(36).substring(2, 5);
      return selectedKeywords.join(" ") + " " + randomLetters;
    }

    /* ---------------------------------------------
       FUNCTION: isBlacklisted
       Checks if a book contains any blacklisted content.
       Blacklisted keywords include politics, dark topics, studies, etc.
    --------------------------------------------- */
    function isBlacklisted(book) {
      const blacklist = [
        "politics", 
        "political", 
        "dark", 
        "biography", 
        "biographies", 
        "studies", 
        "encyclopedia", 
        "encyclopedias",
        "science",
        "grammar",
        "vocabulary",
        "poetry",
        "dictionary",
        "sex"
      ];

      const title = (book.volumeInfo.title || "").toLowerCase();
      const description = (book.volumeInfo.description || "").toLowerCase();
      const categories = book.volumeInfo.categories ? book.volumeInfo.categories.join(" ").toLowerCase() : "";
      
      return blacklist.some(keyword => 
        title.includes(keyword) ||
        description.includes(keyword) ||
        categories.includes(keyword)
      );
    }

    /* ---------------------------------------------
       FUNCTION: getPrimaryCategory
       Returns a book's primary category (if available), otherwise "unknown".
    --------------------------------------------- */
    function getPrimaryCategory(book) {
      if (book.volumeInfo.categories && book.volumeInfo.categories.length > 0) {
        return book.volumeInfo.categories[0].toLowerCase();
      }
      return "unknown";
    }

    /* ---------------------------------------------
       FUNCTION: getDiverseSelection
       Selects a diverse array of books by first picking books
       with unique primary categories. If fewer than the desired
       count are found, fill in the remaining slots with others.
    --------------------------------------------- */
    function getDiverseSelection(books, count) {
      let selected = [];
      const usedCategories = new Set();

      // Choose books with unique categories.
      for (const book of books) {
        const category = getPrimaryCategory(book);
        if (!usedCategories.has(category)) {
          selected.push(book);
          usedCategories.add(category);
        }
        if (selected.length === count) break;
      }
      
      // Fill remaining slots if needed.
      if (selected.length < count) {
        for (const book of books) {
          if (!selected.includes(book)) {
            selected.push(book);
            if (selected.length === count) break;
          }
        }
      }
      return selected;
    }

    /* ---------------------------------------------
       FUNCTION: fetchBooks
       Uses Google Books API with a random fun query to fetch up to 40 book results.
    --------------------------------------------- */
    function fetchBooks() {
      const apiKey = "AIzaSyAV04ZReKi2EAOGsjkZUYFQ6ebmBnFErG0"; // Replace with your Google Books API key if needed.
      const randomQuery = getRandomFunQuery();
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(randomQuery)}&maxResults=40&orderBy=newest&key=${apiKey}`;

      fetch(url)
        .then(response => response.json())
        .then(data => {
          const books = data.items || [];
          displayBooks(books);
        })
        .catch(error => console.error("Error fetching books:", error));
    }

    /* ---------------------------------------------
       FUNCTION: displayBooks
       Filters, diversifies, and displays a set of up to 10 non-blacklisted book recommendations.
    --------------------------------------------- */
    function displayBooks(books) {
      const container = document.getElementById("bookResults");
      container.innerHTML = "";

      // Filter out blacklisted books.
      const filteredBooks = books.filter(book => !isBlacklisted(book));

      // If too few acceptable books remain, re-fetch fresh results.
      if (filteredBooks.length < 5) {
        console.warn("Too few acceptable books. Refreshing query...");
        fetchBooks();
        return;
      }

      // Shuffle filtered results.
      filteredBooks.sort(() => Math.random() - 0.5);

      // Build a diverse selection of books.
      const selectedBooks = getDiverseSelection(filteredBooks, 10);

      // Create book cards and append them to the container.
      selectedBooks.forEach(book => {
        const info = book.volumeInfo;
        const imageSrc = info.imageLinks ? info.imageLinks.thumbnail : "https://via.placeholder.com/100";
        const infoLink = info.infoLink ? info.infoLink : "#";

        // Create a clear and easily editable book card.
        const bookCard = document.createElement("div");
        bookCard.classList.add("book-card");
        bookCard.innerHTML = `
          <!-- Book Cover Image -->
          <img src="${imageSrc}" alt="${info.title}">
          <!-- Book Title as clickable link -->
          <h3><a href="${infoLink}" target="_blank">${info.title}</a></h3>
          <!-- Book Author(s) -->
          <p><strong>Author:</strong> ${info.authors ? info.authors.join(", ") : "Unknown"}</p>
        `;
        container.appendChild(bookCard);
      });
    }

    // Auto-fetch books when the window loads.
    window.onload = fetchBooks;
  