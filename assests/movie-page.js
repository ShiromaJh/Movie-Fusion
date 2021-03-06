var posterEl = document.querySelector("#poster");
var movieInfoEl = document.querySelector("#movie-info");
var sourcesEl = document.querySelector("#sources");
var castEl = document.querySelector("#cast");
var favoriteBtnEl = document.querySelector("#favorite");
var mainEl = document.querySelector("main");

var sources = [
  {
    id: 203,
    icon: "./assests/img/Netflix.jpg",
  },
  {
    id: 387,
    icon: "./assests/img/HBOMax.jpg",
  },
  {
    id: 372,
    icon: "./assests/img/Disney.jpg",
  },
  {
    id: 157,
    icon: "./assests/img/Hulu.jpg",
  },
  {
    id: 26,
    icon: "./assests/img/AmazonPrime.jpg",
  },
];

mediaType = "";

// Grabs information from URL query
var getMovieInfo = function () {
  // grab id and media type from url query string
  var strArr = document.location.search.split(/[&=]+/);
  var movieId = strArr[1];
  var showType = strArr[3];

  if (!movieId || !showType) {
    // if no movie information was given, redirect to the homepage
    document.location.replace("./index.html");
  }
  id = parseInt(movieId);
  mediaType = showType;
  saveBtnDisplay();
};

// Pull movie or TV information from TMDB and Displays information
var movieInfo = function () {
  var apiUrl =
    "https://api.themoviedb.org/3/" +
    mediaType +
    "/" +
    id +
    "?api_key=b7854a2f58fc72f2408614bd5147ec1c&language=en-US";
  fetch(apiUrl).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        console.log(data);
        var posterImg = document.createElement("img");
        var imgSrc = imageCheck(data.poster_path);
        posterImg.setAttribute("src", imgSrc);
        posterEl.appendChild(posterImg);
        var movieDetails = document.createElement("div");
        var date = "";
        var name = "";
        // Logic to display appropriate information based on mediatype of movie or TV
        if (mediaType === "movie") {
          date = data.release_date.slice(0, 4);
          name = data.title;
        } else {
          name = data.name;
          if (
            data.first_air_date.slice(0, 4) === data.last_air_date.slice(0, 4)
          ) {
            date = data.first_air_date.slice(0, 4);
          } else {
            date =
              data.first_air_date.slice(0, 4) +
              " - " +
              data.last_air_date.slice(0, 4);
          }
        }
        movieDetails.innerHTML =
          "<h2 class='title'>" + name + "<span> (" + date + ")</span></h2>";
        var genres = "";
        //lists the genres of the movie/show with limit of 5
        for (var i = 0; i < Math.min(data.genres.length, 5); i++) {
          genres += data.genres[i].name;
          if (i + 1 < Math.min(data.genres.length, 5)) {
            genres += ", ";
          }
        }
        //Shows movie length or tv show seasons/episodes/runtime
        movieDetails.innerHTML += "<p class='subtitle'>" + genres + "</p>";
        if (mediaType === "movie") {
          movieDetails.innerHTML +=
            "<p class='subtitle'>" + data.runtime + " min</p>";
        } else {
          movieDetails.innerHTML +=
            "<p class='subtitle'>Seasons: " +
            data.number_of_seasons +
            "</br>Episodes: " +
            data.number_of_episodes +
            "</br>Avg. Run Time: " +
            data.episode_run_time +
            " min</p>";
        }
        movieDetails.innerHTML +=
          "<p class='content'>" + data.overview + "</p>";
        movieInfoEl.appendChild(movieDetails);
      });
    } else {
      //Error check on API call
      var errorCode = response.status;
      if (response.statusText) {
        errorCode += " - " + response.statusText;
      }
      mainEl.innerHTML =
        "<h2 class = 'title has-text-centered'> We apologize for the incovienance, but there seems to be an error:</br>" +
        errorCode;
    }
  });
};

// Finds the available streaming sources through Watchmode api and displays links
var sourcesInfo = function () {
  var apiUrl =
    "https://api.watchmode.com/v1/search/?apiKey=Mn16itVChM3v7tkB3DIeEwYB6ogYSJiCHvC6jPtC&search_field=tmdb_" +
    mediaType +
    "_id&search_value=" +
    id;
    //First call to get watchmode id
  fetch(apiUrl).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        if(data.title_results.length >0){
        var innerApiUrl =
          "https://api.watchmode.com/v1/title/" +
          data.title_results[0].id +
          "/sources/?apiKey=Mn16itVChM3v7tkB3DIeEwYB6ogYSJiCHvC6jPtC&regions=US";
          //Second call using the id to get link information
        fetch(innerApiUrl).then(function (response) {
          response.json().then(function (info) {
            var count = 0;
            //loops through each source location to compare if it is available and supplies link
            for (var i = 0; i < sources.length; i++) {
              for (var index = 0; index < info.length; index++) {
                if (sources[i].id === info[index].source_id) {
                  var streamLink = document.createElement("div");
                  streamLink.className = "column";
                  streamLink.innerHTML =
                    "<a href='" +
                    info[index].web_url +
                    "'><img src='" +
                    sources[i].icon +
                    "' alt='Streaming Link'></a>";
                  sourcesEl.appendChild(streamLink);
                  count++;
                }
              }
            }
            // Display response if no streaming sources are available
            if (count === 0) {
              sourcesEl.innerHTML =
                "<p class='column is-full'>There are no streaming sources available for this title. </br>Please visit TMDB for other streaming or rental options:</p><a class='column is-full' href='https://www.themoviedb.org/" +
                mediaType +
                "/" +
                id +
                "/watch' target='_blank'><img src='./assests/img/tmdb-logo.svg' alt='TMDB logo' width='350' height='150'></a>";
            }
            console.log(info);
          });
        });
        } else {
          noStreaming(id,mediaType);
        }
      });
    } else {
      //error checking if no streaming is available
      noStreaming(id,mediaType);
    }
  });
};

var noStreaming = function(id,mediaType){
  sourcesEl.innerHTML =
  "<p class='column is-full'>There seems to be a problem finding the streaming sources. </br>Please visit an alternate site, TMDB, for available options:</p><a class='column is-full' href='https://www.themoviedb.org/" +
  mediaType +
  "/" +
  id +
  "/watch' target='_blank'><img src='./assests/img/tmdb-logo.svg' alt='TMDB logo' width='350' height='150'></a>";
}

// Display cast member information from TMDB api
var castInfo = function () {
  var apiUrl =
    "https://api.themoviedb.org/3/" +
    mediaType +
    "/" +
    id +
    "/credits?api_key=b7854a2f58fc72f2408614bd5147ec1c&language=en-US";
  fetch(apiUrl).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        for (var i = 0; i < Math.min(data.cast.length, 5); i++) {
          var cardEl = displayActor(data.cast[i]);
          castEl.appendChild(cardEl);
        }
        console.log(data);
      });
    } else {
      castEl.innerHTML =
        "There were some problems finding cast members for this show: " +
        response.statusText;
    }
  });
};

// Click handler to either add or remove movie from favorites list
var favoritesHandler = function (event) {
  var count = 0;
  for (var i = 0; i < favorites.length; i++) {
    if (favorites[i].id === id) {
      favorites.splice(i, 1);
      count++;
      favoriteBtnEl.classList = "button is-info";
      favoriteBtnEl.textContent = "Add to Favorites";
      break;
    }
  }
  if (count === 0) {
    saveShow(id, mediaType);
    favoriteBtnEl.classList = "button is-info is-light";
    favoriteBtnEl.textContent = "Remove from Favorites";
  }
  console.log(favorites);
  localStorage.setItem("favorites", JSON.stringify(favorites));
};

// Pull favorites list from local storage and check to see if current movie is on list
var saveBtnDisplay = function () {
  for (var i = 0; i < favorites.length; i++) {
    if (favorites[i].id === id) {
      favoriteBtnEl.classList = "button is-info is-light";
      favoriteBtnEl.textContent = "Remove from Favorites";
      break;
    }
  }
};

getMovieInfo();
movieInfo();
sourcesInfo();
castInfo();
favoriteBtnEl.addEventListener("click", favoritesHandler);