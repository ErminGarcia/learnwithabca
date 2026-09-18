document.addEventListener("DOMContentLoaded", function () {
var eventsData = [
{ title: "National Students Convention", images: ["assets/nsc1.jpg", "assets/nsc2.jpg", "assets/nsc3.jpg", "assets/nsc4.jpg", "assets/nsc5.jpg"] },
{ title: "Junior Students Convention", images: ["assets/convention1.png", "assets/jsc2.jpg", "assets/jsc3.jpg", "assets/jsc4.jpg"] },
{ title: "Nutrition Month", images: ["assets/nutrition1.jpg", "assets/nutrition2.jpg", "assets/nutrition3.jpg", "assets/nutrition4.jpg", "assets/nutrition5.jpg", "assets/nutrition6.jpg"] },
{ title: "Graduation & Recognition", images: ["assets/jph1.png", "assets/gr2.jpg", "assets/gr3.jpg", "gr4.jpg", "gr5.jpg", "assets/gr6.jpg", "assets/gr7.jpg", "assets/gr8.jpg"] },
{ title: "", images: ["assets/event5-1.png", "assets/event5-2.png"] },
{ title: "", images: ["assets/event6-1.png", "assets/event6-2.png"] },
{ title: "", images: ["assets/event7-1.png", "assets/event7-2.png"] },
{ title: "", images: ["assets/event8-1.png", "assets/event8-2.png"] }
];

var grid = document.getElementById("eventsGrid");
var overlay = document.getElementById("eventsOverlay");
var modal = document.getElementById("eventsModal");
var titleEl = document.getElementById("eventsTitle");
var carouselEl = document.getElementById("eventsCarousel");
var track = document.getElementById("eventsTrack");
var dotsEl = document.getElementById("eventsDots");
var prevBtn = document.getElementById("eventsPrev");
var nextBtn = document.getElementById("eventsNext");
var closeBtn = document.getElementById("eventsClose");
var fullscreenLayer = document.getElementById("eventsFullscreen");
var fullscreenClose = document.getElementById("eventsFullscreenClose");

var currentImages = [];
var realIndex = 0;
var trackIndex = 1;
var autoTimer = null;
var isFullscreen = false;

var scale = 1;
var panX = 0;
var panY = 0;
var activePointers = {};
var initialPinchDistance = 0;
var initialScale = 1;
var isPanning = false;
var panStartX = 0;
var panStartY = 0;
var panOriginX = 0;
var panOriginY = 0;

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

function getCurrentSlide() {
return track.children[trackIndex] || null;
}

function getCurrentSlideImg() {
var slide = getCurrentSlide();
return slide ? slide.querySelector("img") : null;
}

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
slide.addEventListener("click", function () {
if (!isFullscreen) enterFullscreen();
});
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
resetZoom();
}

function next() {
trackIndex++;
setTrackPosition(true);
realIndex = (realIndex + 1) % currentImages.length;
updateDots();
resetZoom();
}

function prev() {
trackIndex--;
setTrackPosition(true);
realIndex = (realIndex - 1 + currentImages.length) % currentImages.length;
updateDots();
resetZoom();
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

function resetZoom() {
scale = 1;
panX = 0;
panY = 0;
var img = getCurrentSlideImg();
if (img) img.style.transform = "";
}

function applyTransform() {
var img = getCurrentSlideImg();
if (img) img.style.transform = "translate(" + panX + "px," + panY + "px) scale(" + scale + ")";
}

function enterFullscreen() {
isFullscreen = true;
fullscreenLayer.appendChild(carouselEl);
fullscreenLayer.classList.add("open");
document.body.style.overflow = "hidden";
resetZoom();
}

function exitFullscreen() {
isFullscreen = false;
modal.appendChild(carouselEl);
fullscreenLayer.classList.remove("open");
resetZoom();
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
resetZoom();
overlay.classList.add("open");
document.body.style.overflow = "hidden";
startAuto();
}

function closeModal() {
if (isFullscreen) exitFullscreen();
overlay.classList.remove("open");
document.body.style.overflow = "";
stopAuto();
}

function getPointerDistance() {
var ids = Object.keys(activePointers);
var p1 = activePointers[ids[0]];
var p2 = activePointers[ids[1]];
return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

carouselEl.addEventListener("pointerdown", function (e) {
if (!isFullscreen) return;
activePointers[e.pointerId] = { x: e.clientX, y: e.clientY };
var ids = Object.keys(activePointers);
if (ids.length === 1 && scale > 1) {
isPanning = true;
panStartX = e.clientX;
panStartY = e.clientY;
panOriginX = panX;
panOriginY = panY;
var slide = getCurrentSlide();
if (slide) slide.classList.add("dragging");
} else if (ids.length === 2) {
isPanning = false;
initialPinchDistance = getPointerDistance();
initialScale = scale;
}
});

carouselEl.addEventListener("pointermove", function (e) {
if (!isFullscreen) return;
if (!(e.pointerId in activePointers)) return;
activePointers[e.pointerId] = { x: e.clientX, y: e.clientY };
var ids = Object.keys(activePointers);
if (ids.length === 2) {
var dist = getPointerDistance();
scale = Math.min(Math.max(initialScale * (dist / initialPinchDistance), 1), 4);
applyTransform();
} else if (isPanning) {
panX = panOriginX + (e.clientX - panStartX);
panY = panOriginY + (e.clientY - panStartY);
applyTransform();
}
});

function endPointer(e) {
delete activePointers[e.pointerId];
var ids = Object.keys(activePointers);
if (ids.length < 2) initialPinchDistance = 0;
if (ids.length === 0) {
isPanning = false;
var slide = getCurrentSlide();
if (slide) slide.classList.remove("dragging");
if (scale <= 1) {
scale = 1;
panX = 0;
panY = 0;
applyTransform();
}
}
}

carouselEl.addEventListener("pointerup", endPointer);
carouselEl.addEventListener("pointercancel", endPointer);
carouselEl.addEventListener("pointerleave", endPointer);

carouselEl.addEventListener("wheel", function (e) {
if (!isFullscreen) return;
e.preventDefault();
scale += e.deltaY < 0 ? 0.18 : -0.18;
scale = Math.min(Math.max(scale, 1), 4);
if (scale === 1) {
panX = 0;
panY = 0;
}
applyTransform();
}, { passive: false });

carouselEl.addEventListener("dblclick", function () {
if (!isFullscreen) return;
scale = scale > 1 ? 1 : 2.5;
panX = 0;
panY = 0;
applyTransform();
});

nextBtn.addEventListener("click", function () {
next();
startAuto();
});
prevBtn.addEventListener("click", function () {
prev();
startAuto();
});
closeBtn.addEventListener("click", closeModal);
fullscreenClose.addEventListener("click", exitFullscreen);
overlay.addEventListener("click", function (e) {
if (e.target === overlay) closeModal();
});
document.addEventListener("keydown", function (e) {
if (!overlay.classList.contains("open")) return;
if (e.key === "Escape") {
if (isFullscreen) exitFullscreen();
else closeModal();
}
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
