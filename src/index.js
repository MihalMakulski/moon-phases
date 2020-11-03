import "./styles.css";
import Glide from "@glidejs/glide";

import bg from "./assets/bg.jpg";

const glide = new Glide("#app", {
  type: "carousel",
  perView: 1,
  focusAt: "center"
});

const configMoon = {
  lang: "en",
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  size: "100%",
  lightColor: "#fffff0",
  shadeColor: "rgba(0,0,0,.7)",
  texturize: true
};

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

document.body.style.backgroundImage = bg;

getMoonPhases(configMoon).then(renderApp);

function renderApp(moonData) {
  const { monthName, phase, nameDay } = moonData;
  const header = document.querySelector("h1");
  const slider = document.getElementById("slider");
  const days = Object.keys(phase).map((key) => {
    const obj = phase[key];
    obj.date = key;

    return { ...obj };
  });
  const sortedDays = sortDays(days);
  const slides = sortedDays.map(slideTmpl(nameDay)).join("");

  slider.querySelector(".glide__slides").innerHTML = slides;
  header.querySelector("span").textContent = monthName;
  glide.mount();
}

function sortDays(phases) {
  const today = new Date().getDate();
  const firstPart = phases.slice(today - 1);
  const secondPart = phases.slice(0, today - 1);

  return firstPart.concat(secondPart);
}

function slideTmpl(nameDay) {
  return function (phase, idx) {
    const d = new Date(configMoon.year, configMoon.month - 1, phase.date);
    return `<li class="glide__slide">
      <h2>${phase.date} (${days[d.getDay()]})</h2>
      <div class="phase-image-container">
        ${phase.svg}
      </div>
      <div>${phase.npWidget}</div>
      ${phase.timeEvent ? `<div>${phase.timeEvent}</div>` : ""}
    </li>`;
  };
}

function getMoonPhases(configMoon) {
  const url = `https://www.icalendar37.net/lunar/api/?${objToParams(
    configMoon
  )}`;
  const cache = localStorage.getItem("moon-phases");
  const cacheObj = (cache && JSON.parse(cache)) || {};
  const cachedMonthData = cacheObj[`${configMoon.month}-${configMoon.year}`];

  if (cachedMonthData) {
    return Promise.resolve(cachedMonthData);
  }

  return fetch(url)
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      }

      throw new Error("Fetch err");
    })
    .then(cacheResponse);
}

function cacheResponse(data) {
  const cache = localStorage.getItem("moon-phases");
  const cacheObj = (cache && JSON.parse(cache)) || {};

  cacheObj[`${configMoon.month}-${configMoon.year}`] = data;

  localStorage.setItem("moon-phases", JSON.stringify(cacheObj));

  return Promise.resolve(data);
}

function objToParams(obj) {
  return Object.keys(obj)
    .map((key) => key + "=" + encodeURIComponent(obj[key]))
    .concat(["LDZ=" + new Date(obj.year, obj.month - 1, 1) / 1000])
    .join("&");
}
