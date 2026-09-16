document.addEventListener("DOMContentLoaded", function () {
var eventsData = [
{ title: "National Students Convention", images: ["assets/convention1.png", "assets/convention2.png", "assets/convention3.png", "assets/convention4.png", "assets/convention5.png", "assets/convention6.png"] },
{ title: "Junior Students Convention", images: ["assets/jsc1.png", "assets/jsc2.png"] },
{ title: "Nutrition Months", images: ["assets/nutrition1.png", "assets/nutrition2.png"] },
{ title: "", images: ["assets/event4-1.png", "assets/event4-2.png"] },
{ title: "", images: ["assets/event5-1.png", "assets/event5-2.png"] },
{ title: "", images: ["assets/event6-1.png", "assets/event6-2.png"] },
{ title: "", images: ["assets/event7-1.png", "assets/event7-2.png"] },
{ title: "", images: ["assets/event8-1.png", "assets/event8-2.png"] }
];

var grid = document.getElementById("eventsGrid");
var overlay = document.getElementById("eventsOverlay");
var modal = document.getElementById("eventsModal");
var titleEl = document.getElementById("eventsTitle");
var track = document.getElementById("eventsTrack");
var dotsEl = document.getElementById("eventsDots");
var prevBtn = document.getElementById("eventsPrev");
var nextBtn = document.getElementById("eventsNext");
var closeBtn = document.getElementById("eventsClose");

var currentImages = [];
var realIndex = 0;
var trackIndex = 1;
var autoTimer = null;
var isZoomed = false;

eventsData.forEach(function (eventItem, i) {
var tile = document.createElement("div");
tile.className = "events-tile";
tile.tabIndex = 0;
tile.setAttribute("role", "button");
tile.setAttribute("aria-label", eventItem.title ? eventItem.title : "View event photos");

var img = document.createElement("img");
img.src = eventItem.images[0];
img.alt = eventItem.title ? eventItem.title : "ABCA event photo";
img.loading = "lazy";
tile.appendChild(img);

var label = document.createElement("span");
label.className = "events-tile-label";
label.textContent = eventItem.title;
tile.appendChild(label);

var icon = document.createElement("span");
icon.className = "events-tile-icon";
icon.textContent = "+";
tile.appendChild(icon);

tile.addEventListener("click", function () {
openModal(i);
});
tile.addEventListener("keydown", function (e) {
if (e.key === "Enter" || e.key === " ") {
e.preventDefault();
openModal(i);
}
});

grid.appendChild(tile);
});

function buildTrack(images) {
track.innerHTML = "";
var all = [images[images.length - 1]].concat(images, [images[0]]);
all.forEach(function (src) {
var slide = document.createElement("div");
slide.className = "events-slide";
var img = document.createElement("img");
img.src = src;
img.alt = "";
slide.appendChild(img);
slide.addEventListener("click", toggleZoom);
track.appendChild(slide);
});
}

function buildDots(count) {
dotsEl.innerHTML = "";
for (var i = 0; i < count; i++) {
var dot = document.createElement("button");
dot.className = "dot" + (i === 0 ? " active" : "");
dot.setAttribute("aria-label", "Go to photo " + (i + 1));
dot.addEventListener("click", (function (idx) {
return function () {
goTo(idx);
startAuto();
};
})(i));
dotsEl.appendChild(dot);
}
}

function updateDots() {
var dots = dotsEl.querySelectorAll(".dot");
dots.forEach(function (dot, i) {
dot.classList.toggle("active", i === realIndex);
});
}

function setTrackPosition(withTransition) {
track.classList.toggle("no-transition", !withTransition);
track.style.transform = "translateX(-" + trackIndex * 100 + "%)";
}

function goTo(index) {
trackIndex = index + 1;
realIndex = index;
setTrackPosition(true);
updateDots();
}

function next() {
trackIndex++;
setTrackPosition(true);
realIndex = (realIndex + 1) % currentImages.length;
updateDots();
}

function prev() {
trackIndex--;
setTrackPosition(true);
realIndex = (realIndex - 1 + currentImages.length) % currentImages.length;
updateDots();
}

track.addEventListener("transitionend", function () {
if (trackIndex === currentImages.length + 1) {
trackIndex = 1;
setTrackPosition(false);
} else if (trackIndex === 0) {
trackIndex = currentImages.length;
setTrackPosition(false);
}
});

function startAuto() {
stopAuto();
autoTimer = setInterval(next, 4000);
}

function stopAuto() {
if (autoTimer) {
clearInterval(autoTimer);
autoTimer = null;
}
}

function toggleZoom() {
isZoomed = !isZoomed;
modal.classList.toggle("zoomed", isZoomed);
}

function openModal(i) {
var eventItem = eventsData[i];
currentImages = eventItem.images;
titleEl.textContent = eventItem.title || "Event Photos";
buildTrack(currentImages);
buildDots(currentImages.length);
trackIndex = 1;
realIndex = 0;
setTrackPosition(false);
isZoomed = false;
modal.classList.remove("zoomed");
overlay.classList.add("open");
document.body.style.overflow = "hidden";
startAuto();
}

function closeModal() {
overlay.classList.remove("open");
document.body.style.overflow = "";
stopAuto();
isZoomed = false;
modal.classList.remove("zoomed");
}

nextBtn.addEventListener("click", function () {
next();
startAuto();
});
prevBtn.addEventListener("click", function () {
prev();
startAuto();
});
closeBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", function (e) {
if (e.target === overlay) {
closeModal();
}
});
document.addEventListener("keydown", function (e) {
if (!overlay.classList.contains("open")) return;
if (e.key === "Escape") closeModal();
if (e.key === "ArrowRight") {
next();
startAuto();
}
if (e.key === "ArrowLeft") {
prev();
startAuto();
}
});
});
                                                      
