// stratigraphy.js - turkana edition
//
// This is a global js file that should work in every page.

const POSITION_BEHAVIOR_CENTERED = "centered";
const POSITION_BEHAVIOR_LEFT_RIGHT = "left/right";

const registerClickToDismiss = cls => {
  const selector = `.${cls}`;
  if ($(selector).length) {
    $(selector).on("click", () => hideHoverImage(selector));
  }
};

const isSmallScreen = () => {
  const smallest = Math.min(window.innerWidth, window.innerHeight);
  return smallest < 480;
};

const whackHoverImage = (prefix, positionBehavior) => (e, ident, over) => {
  if (isSmallScreen() && !over) {
    // this event screws things up by causing hover img to disappear immediately.
    return; // on phones, user will click to dismiss instead.
  }
  window.setTimeout(() => {
    const selector = `#${prefix}${ident}`;
    if ($(selector).length) {
      if (over) {
        showHoverImage(selector, e, positionBehavior);
      } else {
        hideHoverImage(selector);
      }
    } else {
      console.warn("Could not find selector:", selector);
    }
  }, 0);
};

makePositionStyle = (e, positionBehavior) => {
  switch (positionBehavior) {
    case POSITION_BEHAVIOR_LEFT_RIGHT:
      if (isSmallScreen()) {
        return `
          width: auto;
          height: 100%;
          max-width: 90vw;
          max-height: 90vh;
          border: 8px solid blue;
        `;
      } else {
        const rect = e.getBoundingClientRect();
        const midX = window.innerWidth / 2;
        const side = rect.x > midX ? "right" : "left";
        const otherSide = rect.x >= midX ? "left" : "right";
        return `
          ${side}: 50vw;
          ${otherSide}: auto;
          transform: translate(0, -50%);
        `;
      }
    default:
    case POSITION_BEHAVIOR_CENTERED:
      return ``;
  }
};

const showHoverImage = (selector, e, positionBehavior) => {
  window.setTimeout(() => {
    $(selector).removeClass("strat-hide-img");
    $(selector).removeClass("strat-hover-img-fullscreen");
    $(selector).removeClass("strat-hover-img-position");
    $(selector).addClass("strat-show-img");
    if (isSmallScreen()) {
      $(selector).addClass("strat-hover-img-fullscreen");
    } else {
      $(selector).addClass("strat-hover-img-position");
      const position = makePositionStyle(e, positionBehavior);
      $(selector).attr("style", position);
    }
  }, 0);
};

const hideHoverImage = selector => {
  window.setTimeout(() => {
    $(selector).removeClass("strat-show-img");
    $(selector).removeClass("strat-hover-img-fullscreen");
    $(selector).removeClass("strat-hover-img-position");
    $(selector).addClass("strat-hide-img");
  }, 0);
};

const domSubtreeEvent = widthStyle => (mutationsList, observer) => {
  console.log("domSubtreeEvent invoked with:");
  console.log("mutationsList:", mutationsList);
  console.log("observer", observer);
  console.log("add style:", widthStyle);
};

const updateLargeSvgSize = () => {
  if (!$("#measure").length) {
    console.warn(
      "Warning: measure div does not exist. Did you forget to add it? Not fixing SVG size."
    );
    return;
  }
  const measureWidth = $("#measure")[0].getBoundingClientRect().width;
  const widthStyle = `width: ${measureWidth}px`;
  $("#ajaxContentParent").attr("style", widthStyle);

  // There might be related images that will have to scale similarly
  // If they are already loaded, set their width directly.
  $(".resetwidth").attr("style", widthStyle);
  // If they're not yet loaded, set their width once they show up.
  const zoomableContentParent = document.getElementById(
    "zoomableContentParent"
  );
  if (zoomableContentParent) {
    const mutationCfg = { childList: true, subtree: true };
    const observer = new MutationObserver(domSubtreeEvent(widthStyle));
    observer.observe(zoomableContentParent, mutationCfg);
  }
};

const loadLargeSvg = (targetSelector, svgUrl, successCallback) => {
  $.ajax({
    url: svgUrl,
    success: function(data) {
      $(targetSelector).replaceWith(data);
      window.setTimeout(updateLargeSvgSize, 0);
      if (successCallback) {
        successCallback();
      }
    },
    cache: false
  });
};

// navTo is for internal linking from SVGs. This is to sidestep a limitation in some
// browsers like Safari.
const navTo = id => {
  $("#" + id)[0].scrollIntoView();
};

// these pano-related functiosn deal with 360-degre panographic embeds. They require
// the page to have a certain structure (e.g. divs named #embed-123)
let currentPano = null;
const hidePano = () => {
  if (currentPano != null) {
    $(currentPano).attr("style", null);
    $(currentPano).removeClass("pano-show-img");
    $(currentPano).removeClass("strat-hover-img-fullscreen");
    $(currentPano).removeClass("pano-show-img-mobile");
    $(currentPano).addClass("pano-hide-img");
    $(".w-nav").attr("style", null);
    $(".w-dropdown-toggle").attr("style", null);
    currentPano = null;
  }
};
const showPano = (e, ident) => {
  try {
    let rect = e.getBoundingClientRect();
    let midX = window.innerWidth / 2;
    // user has requested to show pano-N (where N is ident) near element e.
    let nextPano = "#embed-" + ident;
    const bailOut = nextPano === currentPano;
    hidePano(); // in case something is already showing
    if (bailOut) {
      return;
    }
    currentPano = "#embed-" + ident;
    $(currentPano).addClass("pano-show-img");
    if (isSmallScreen()) {
      $(currentPano).addClass("strat-hover-img-fullscreen");
      $(currentPano).addClass("pano-show-img-mobile");
      $(".w-nav").attr("style", "display: none");
      $(".w-dropdown-toggle").attr("style", "display: none");
      $(currentPano + " iframe").attr("style", null); // cuz it has width/height
      $(currentPano + " iframe").attr("width", window.innerWidth);
      $(currentPano + " iframe").attr("height", window.innerHeight - 40);
    } else {
      const position = `
            ${rect.x > midX ? "right" : "left"}: 50vw;
        `;
      $(currentPano).attr("style", position);
    }
  } catch (err) {
    console.log(`ignoring error for ${currentPano}:`, err);
  }
};

// Tooltips

// the tooltips input should be a dictionary of { id : message}, e.g.
// tooltips = { 'oil-1' : '<span>848,383 bbl <br />Gallup Formation</span>' }
//
// targetSelectors should be an array of selectors that the tooltips will be
// attached to.
const loadTooltips = (tooltips, targetSelectors) => {
  targetSelectors.forEach(selector => {
    $(selector).each(function(_, elm) {
      $(elm).attr("data-tippy", tooltips[elm.id]);
    });
  });
  $.getScript("https://unpkg.com/tippy.js@3/dist/tippy.all.min.js");
};
