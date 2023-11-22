// ==UserScript==
// @name         ImmobilienScout24 Bot
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Living in Berlin but automated
// @author       kevinvn.nl
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// @match        https://www.immobilienscout24.de/Suche*
// ==/UserScript==

// enable sound and popups in chrome for this site
// example url: https://www.immobilienscout24.de/Suche/de/berlin/berlin/wohnung-mieten?sorting=2

let listings = [];
let newListings = [];
let oldListings = [];

(function () {
	'use strict';
	// console.log('userscript running');

	// wait for the dom to be loaded
	window.onload = function () {
		// wait 0.5s for the page to load
		setTimeout(() => {
			// console.log('dom loaded');
			listings = document.querySelectorAll('#resultListItems > li');
			checkForNewListings();
		}, 1000);
	};
})();

function checkForNewListings() {
	const savedListings = getSavedListings();
	console.log('savedListings', savedListings.length);

	listings.forEach((listing) => {
		// console.log(listing);
		let saidSomething = false;

		if (listing.dataset.id && listing.dataset.id !== '') {
			const id = listing.dataset.id;
			if (!savedListings.includes(id)) {
				newListings[id] = listing;
				saveListings(id);

				if (saidSomething == false) {
					console.log('new listing found');
					saySomething(`found a new listing!`);
					saidSomething = true;
				}
				openNewListings(listing);
			} else {
				oldListings.push(id);
			}
		}
	});
	// cleanListings();
	if (newListings.length > 0 && newListings.length < 10) {
	} else {
		console.log('no new listings, checking again in 10 seconds');
	}
	setTimeout(() => {
		location.reload();
	}, 10000);
}

function openNewListings(listing) {
	const url = listing.querySelector(
		'.result-list-entry__brand-title-container'
	).href;
	window.open(url, '_blank');

	// TODO: after opening the tab, check if the tab is checking for a captcha
}

function saySomething(message = 'Check your screen!') {
	let speech;
	if ('speechSynthesis' in window) {
		speech = new SpeechSynthesisUtterance(message);
		speech.voice = speechSynthesis.getVoices()[0];
	}
	window.speechSynthesis.speak(speech);
}

function printListings(listings) {
	console.log(`${listings.lenght} listings found`);
	listings.forEach((listing) => {
		const url = listing.querySelector(
			'.result-list-entry__brand-title-container'
		).href;
		console.log(url);
	});
}

function saveListings(listingId) {
	const savedListings = getSavedListings();
	if (savedListings) {
		savedListings.push(listingId);
		localStorage.setItem('savedListings', JSON.stringify(savedListings));
	} else {
		localStorage.setItem('savedListings', JSON.stringify([listingId]));
	}
}

function getSavedListings() {
	const savedListings = localStorage.getItem('savedListings');
	return savedListings ? JSON.parse(savedListings) : [];
}
