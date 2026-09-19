document.addEventListener("DOMContentLoaded", function () {

var eventsData = [

{ title: "National Students Convention", images: ["assets/intro.jpg", "assets/nsc2.jpg", "assets/nsc3.jpg", "assets/nsc4.jpg", "assets/nsc5.jpg"] },
{ title: "Junior Students Convention", images: ["assets/jsc1.JPG", "assets/jsc2.jpg", "assets/jsc3.jpg", "assets/jsc4.jpg", "assets/jsc5.JPG"] },

{ title: "Nutrition Month", images: ["assets/nutrition1.jpg", "assets/nutrition2.jpg", "assets/nutrition3.jpg", "assets/nutrition4.jpg", "assets/nutrition5.jpg", "assets/nutrition6.jpg"] },
{ title: "Graduation & Recognition", images: ["assets/gr1.jpg", "assets/gr2.jpg", "assets/gr3.jpg", "assets/gr4.jpg", "assets/gr5.jpg", "assets/gr6.jpg", "assets/gr7.jpg", "assets/gr8.jpg"] },

{ title: "Field Trip", images: ["assets/field1.jpg", "assets/field2.JPG", "assets/field3.JPG", "assets/field4.jpg", "assets/field5.jpg"] },

{ title: "Buwan ng Wika", images: ["assets/bwk1.png", "assets/bwk2.png", "assets/bwk3.png", "bwk4.png"] },

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

var currentMedia = [];
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
var imageRetryLimit = 4;
var videoRetryLimit = 3;

function isVideoSource(src) {
return /\.(mp4|webm|ogg|ogv|m4v)(?:[?#].*)?$/i.test(src);
}

function normalizeMediaItem(item) {
if (typeof item === "string") {
return {
type: isVideoSource(item) ? "video" : "image",
src: item
};
}

if (item && typeof item === "object") {
return {
type: item.type === "video" || item.type === "image" ? item.type : isVideoSource(item.src || "") ? "video" : "image",
src: item.src || "",
poster: item.poster || ""
};
}

return {
type: "image",
src: ""
};
}

function getNormalizedMedia(items) {
return (items || []).map(normalizeMediaItem).filter(function (item) {
return item.src;
});
}

function createSpinner() {
var spinner = document.createElement("span");
spinner.className = "events-loading-spinner";
spinner.setAttribute("aria-hidden", "true");
spinner.style.position = "absolute";
spinner.style.left = "50%";
spinner.style.top = "50%";
spinner.style.width = "34px";
spinner.style.height = "34px";
spinner.style.margin = "-17px 0 0 -17px";
spinner.style.border = "3px solid rgba(255,255,255,0.35)";
spinner.style.borderTopColor = "#ffffff";
spinner.style.borderRadius = "50%";
spinner.style.animation = "eventsSpinner 0.8s linear infinite";
spinner.style.zIndex = "5";
return spinner;
}

function addSpinnerAnimation() {
if (document.getElementById("eventsSpinnerStyle")) return;

var style = document.createElement("style");
style.id = "eventsSpinnerStyle";
style.textContent = "@keyframes eventsSpinner{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}";
document.head.appendChild(style);
}

function prepareContainer(container) {
container.style.position = "relative";
var spinner = createSpinner();
container.appendChild(spinner);
return spinner;
}

function retryUrl(src, attempt) {
var separator = src.indexOf("?") === -1 ? "?" : "&";
return src + separator + "eventsRetry=" + attempt + "&t=" + Date.now();
}

function loadImage(img, src, spinner, retryCount) {
var attempt = retryCount || 0;
var resolvedSrc = attempt > 0 ? retryUrl(src, attempt) : src;

spinner.style.display = "block";
img.style.opacity = "0";
img.src = resolvedSrc;

var finish = false;

function success() {
if (finish) return;

finish = true;
img.removeEventListener("load", success);
img.removeEventListener("error", failure);

var show = function () {
img.style.opacity = "1";
spinner.style.display = "none";
};

if (typeof img.decode === "function") {
img.decode().then(show).catch(show);
} else {
show();
}
}

function failure() {
if (finish) return;

finish = true;
img.removeEventListener("load", success);
img.removeEventListener("error", failure);

if (attempt < imageRetryLimit) {
setTimeout(function () {
loadImage(img, src, spinner, attempt + 1);
}, Math.min(800 * Math.pow(2, attempt), 4000));
} else {
spinner.style.display = "none";
img.style.opacity = "1";
img.alt = "Unable to load event photo";
}
}

img.addEventListener("load", success, { once: true });
img.addEventListener("error", failure, { once: true });

if (img.complete && img.naturalWidth > 0) {
setTimeout(success, 0);
}
}

function loadVideo(video, item, spinner, retryCount) {
var attempt = retryCount || 0;
var src = attempt > 0 ? retryUrl(item.src, attempt) : item.src;
var finished = false;

spinner.style.display = "block";
video.style.opacity = "0";
video.src = src;

if (item.poster) video.poster = item.poster;

video.load();

function success() {
if (finished) return;

finished = true;
video.removeEventListener("loadeddata", success);
video.removeEventListener("error", failure);

video.style.opacity = "1";
spinner.style.display = "none";
}

function failure() {
if (finished) return;

finished = true;
video.removeEventListener("loadeddata", success);
video.removeEventListener("error", failure);

if (attempt < videoRetryLimit) {
setTimeout(function () {
loadVideo(video, item, spinner, attempt + 1);
}, Math.min(1000 * Math.pow(2, attempt), 4000));
} else {
spinner.style.display = "none";
video.style.opacity = "1";
}
}

video.addEventListener("loadeddata", success, { once: true });
video.addEventListener("error", failure, { once: true });
}

function createMediaElement(item, options) {
var media = null;
var spinner = null;
var container = options.container;

spinner = prepareContainer(container);

if (item.type === "video") {
media = document.createElement("video");
media.controls = true;
media.playsInline = true;
media.preload = options.preload || "metadata";
media.muted = false;
media.className = "events-video";
media.setAttribute("aria-label", options.alt || "ABCA event video");
media.style.opacity = "0";
media.style.transition = "opacity 0.15s ease";

if (item.poster) {
media.poster = item.poster;
}

loadVideo(media, item, spinner, 0);

} else {

media = document.createElement("img");
media.alt = options.alt || "ABCA event photo";
media.decoding = "async";
media.loading = options.loading || "lazy";
media.className = "events-image";
media.style.opacity = "0";
media.style.transition = "opacity 0.15s ease";

loadImage(media, item.src, spinner, 0);
}

container.appendChild(media);

media.addEventListener("error", function () {
spinner.style.display = "block";
});

return media;
}

function stopAllVideos(exceptVideo) {
track.querySelectorAll("video").forEach(function (video) {
if (video !== exceptVideo) {
video.pause();
}
});
}

function getCurrentSlide() {
return track.children[trackIndex] || null;
}

function getCurrentMediaElement() {
var slide = getCurrentSlide();

if (!slide) {
return null;
}

return slide.querySelector("img, video");
}

function getCurrentSlideImg() {
var media = getCurrentMediaElement();

return media && media.tagName === "IMG" ? media : null;
}

function handleVideoSlide(slide) {
if (!slide) return;

var video = slide.querySelector("video");

if (!video) return;

stopAllVideos(video);

video.currentTime = 0;

var shouldAutoAdvance = function () {
stopAuto();
next();
};

video.onended = shouldAutoAdvance;

video.play().catch(function () {
video.controls = true;
});
}

function updateCurrentMediaBehavior() {
var slide = getCurrentSlide();

if (!slide) return;

var media = slide.querySelector("img, video");

if (!media) return;

if (media.tagName === "VIDEO") {
handleVideoSlide(slide);
} else {
stopAllVideos();
startAuto();
}
}

eventsData.forEach(function (eventItem, i) {

var mediaItems = getNormalizedMedia(eventItem.images || eventItem.media);

if (!mediaItems.length) return;

var tile = document.createElement("div");

tile.className = "events-tile";
tile.tabIndex = 0;
tile.setAttribute("role", "button");
tile.setAttribute("aria-label", eventItem.title ? eventItem.title : "View event photos");

var firstItem = mediaItems[0];

var tileMedia = createMediaElement(firstItem, {
container: tile,
alt: eventItem.title ? eventItem.title : firstItem.type === "video" ? "ABCA event video" : "ABCA event photo",
loading: "lazy",
preload: "metadata"
});

if (tileMedia.tagName === "VIDEO") {
tileMedia.muted = true;
tileMedia.controls = false;
tileMedia.loop = true;
tileMedia.autoplay = false;

tileMedia.addEventListener("loadeddata", function () {
tileMedia.currentTime = 0;
});
}

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

function buildTrack(mediaItems) {

track.innerHTML = "";

var normalized = getNormalizedMedia(mediaItems);

var all = [normalized[normalized.length - 1]].concat(normalized, [normalized[0]]);

all.forEach(function (item) {

var slide = document.createElement("div");

slide.className = "events-slide";
slide.style.position = "relative";

var media = createMediaElement(item, {
container: slide,
alt: item.type === "video" ? "ABCA event video" : "ABCA event photo",
loading: "eager",
preload: item.type === "video" ? "metadata" : "auto"
});

if (item.type === "video") {
media.controls = true;
media.setAttribute("playsinline", "");
}

slide.addEventListener("click", function (e) {

if (e.target && e.target.tagName === "VIDEO") {
return;
}

if (!isFullscreen) {
enterFullscreen();
}

});

track.appendChild(slide);

});
}

function buildDots(count) {

dotsEl.innerHTML = "";

for (var i = 0; i < count; i++) {

var dot = document.createElement("button");

dot.className = "dot" + (i === 0 ? " active" : "");
dot.setAttribute("aria-label", "Go to item " + (i + 1));

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

if (!currentMedia.length) return;

trackIndex = index + 1;
realIndex = index;

setTrackPosition(true);
updateDots();
resetZoom();
updateCurrentMediaBehavior();

}

function next() {

if (!currentMedia.length) return;

trackIndex++;

setTrackPosition(true);

realIndex = (realIndex + 1) % currentMedia.length;

updateDots();
resetZoom();

}

function prev() {

if (!currentMedia.length) return;

trackIndex--;

setTrackPosition(true);

realIndex = (realIndex - 1 + currentMedia.length) % currentMedia.length;

updateDots();
resetZoom();

}

track.addEventListener("transitionend", function () {

if (trackIndex === currentMedia.length + 1) {

trackIndex = 1;
setTrackPosition(false);

} else if (trackIndex === 0) {

trackIndex = currentMedia.length;
setTrackPosition(false);

}

updateCurrentMediaBehavior();

});

function startAuto() {

stopAuto();

if (!currentMedia.length || currentMedia[realIndex].type === "video") {
return;
}

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

if (img) {
img.style.transform = "";
}

}

function applyTransform() {

var img = getCurrentSlideImg();

if (img) {
img.style.transform = "translate(" + panX + "px," + panY + "px) scale(" + scale + ")";
}

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

currentMedia = getNormalizedMedia(eventItem.images || eventItem.media);

if (!currentMedia.length) return;

titleEl.textContent = eventItem.title || "Event Photos";

buildTrack(currentMedia);
buildDots(currentMedia.length);

trackIndex = 1;
realIndex = 0;

setTrackPosition(false);
resetZoom();

overlay.classList.add("open");
document.body.style.overflow = "hidden";

updateCurrentMediaBehavior();

}

function closeModal() {

if (isFullscreen) {
exitFullscreen();
}

overlay.classList.remove("open");
document.body.style.overflow = "";

stopAuto();
stopAllVideos();

}

function getPointerDistance() {

var ids = Object.keys(activePointers);

var p1 = activePointers[ids[0]];
var p2 = activePointers[ids[1]];

return Math.hypot(p2.x - p1.x, p2.y - p1.y);

}

carouselEl.addEventListener("pointerdown", function (e) {

if (!isFullscreen) return;

var current = getCurrentMediaElement();

if (current && current.tagName === "VIDEO") return;

activePointers[e.pointerId] = {
x: e.clientX,
y: e.clientY
};

var ids = Object.keys(activePointers);

if (ids.length === 1 && scale > 1) {

isPanning = true;

panStartX = e.clientX;
panStartY = e.clientY;

panOriginX = panX;
panOriginY = panY;

var slide = getCurrentSlide();

if (slide) {
slide.classList.add("dragging");
}

} else if (ids.length === 2) {

isPanning = false;

initialPinchDistance = getPointerDistance();
initialScale = scale;

}

});

carouselEl.addEventListener("pointermove", function (e) {

if (!isFullscreen) return;

if (!(e.pointerId in activePointers)) return;

var current = getCurrentMediaElement();

if (current && current.tagName === "VIDEO") return;

activePointers[e.pointerId] = {
x: e.clientX,
y: e.clientY
};

var ids = Object.keys(activePointers);

if (ids.length === 2 && initialPinchDistance) {

var dist = getPointerDistance();

scale = Math.min(
Math.max(initialScale * (dist / initialPinchDistance), 1),
4
);

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

if (ids.length < 2) {
initialPinchDistance = 0;
}

if (ids.length === 0) {

isPanning = false;

var slide = getCurrentSlide();

if (slide) {
slide.classList.remove("dragging");
}

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

var current = getCurrentMediaElement();

if (current && current.tagName === "VIDEO") return;

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

var current = getCurrentMediaElement();

if (current && current.tagName === "VIDEO") return;

scale = scale > 1 ? 1 : 2.5;

panX = 0;
panY = 0;

applyTransform();

});

nextBtn.addEventListener("click", function () {

next();
updateCurrentMediaBehavior();

if (currentMedia[realIndex] && currentMedia[realIndex].type !== "video") {
startAuto();
}

});

prevBtn.addEventListener("click", function () {

prev();
updateCurrentMediaBehavior();

if (currentMedia[realIndex] && currentMedia[realIndex].type !== "video") {
startAuto();
}

});

closeBtn.addEventListener("click", closeModal);
fullscreenClose.addEventListener("click", exitFullscreen);

overlay.addEventListener("click", function (e) {

if (e.target === overlay) {
closeModal();
}

});

document.addEventListener("keydown", function (e) {

if (!overlay.classList.contains("open")) return;

if (e.key === "Escape") {

if (isFullscreen) {
exitFullscreen();
} else {
closeModal();
}

}

if (e.key === "ArrowRight") {

next();
updateCurrentMediaBehavior();

if (currentMedia[realIndex] && currentMedia[realIndex].type !== "video") {
startAuto();
}

}

if (e.key === "ArrowLeft") {

prev();
updateCurrentMediaBehavior();

if (currentMedia[realIndex] && currentMedia[realIndex].type !== "video") {
startAuto();
}

}

});

addSpinnerAnimation();

});
