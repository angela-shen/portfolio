console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

navLinks = $$("nav a")

let currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname
  );

currentLink?.classList.add('current');
