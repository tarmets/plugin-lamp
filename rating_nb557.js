(function () {
	'use strict';

	function rating_kp_imdb(card) {
		var network = new Lampa.Reguest();
		var clean_title = kpCleanTitle(card.title);
		var search_date = card.release_date || card.first_air_date || card.last_air_date || '0000';
		var search_year = parseInt((search_date + '').slice(0, 4));
		var orig = card.original_title || card.original_name;
		var kp_prox = '';
		var params = {
			id: card.id,
			url: kp_prox + 'https://kinopoiskapiunofficial.tech/',
			rating_url: kp_prox + 'https://rating.kinopoisk.ru/',
			headers: {
				'X-API-KEY': '2a4a0808-81a3-40ae-b0d3-e11335ede616'
			},
			cache_time: 60 * 60 * 24 * 1000 //86400000 сек = 1день Время кэша в секундах
		};
		getRating();

		function getRating() {
			var movieRating = _getCache(params.id);
			if (movieRating) {
				return _showRating(movieRating[params.id]);
			} else {
				searchFilm();
			}
		}

		function searchFilm() {
			var url = params.url;
			var url_by_title = Lampa.Utils.addUrlComponent(url + 'api/v2.1/films/search-by-keyword', 'keyword=' + encodeURIComponent(clean_title));
			if (card.imdb_id) url = Lampa.Utils.addUrlComponent(url + 'api/v2.2/films', 'imdbId=' + encodeURIComponent(card.imdb_id));
			else url = url_by_title;
			network.clear();
			network.timeout(15000);
			network.silent(url, function (json) {
				if (json.items && json.items.length) chooseFilm(json.items);
				else if (json.films && json.films.length) chooseFilm(json.films);
				else if (url !== url_by_title) {
					network.clear();
					network.timeout(15000);
					network.silent(url_by_title, function (json) {
						if (json.items && json.items.length) chooseFilm(json.items);
						else if (json.films && json.films.length) chooseFilm(json.films);
						else chooseFilm([]);
					}, function (a, c) {
						showError(network.errorDecode(a, c));
					}, false, {
						headers: params.headers
					});
				} else chooseFilm([]);
			}, function (a, c) {
				showError(network.errorDecode(a, c));
			}, false, {
				headers: params.headers
			});
		}

		function chooseFilm(items) {
			if (items && items.length) {
				var is_sure = false;
				var is_imdb = false;
				items.forEach(function (c) {
					var year = c.start_date || c.year || '0000';
					c.tmp_year = parseInt((year + '').slice(0, 4));
				});
				if (card.imdb_id) {
					var tmp = items.filter(function (elem) {
						return (elem.imdb_id || elem.imdbId) == card.imdb_id;
					});
					if (tmp.length) {
						items = tmp;
						is_sure = true;
						is_imdb = true;
					}
				}
				var cards = items;
				if (cards.length) {
					if (orig) {
						var _tmp = cards.filter(function (elem) {
		