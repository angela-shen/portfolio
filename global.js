console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
 }

// let navLinks = $$("nav a");

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname
//   );

// currentLink?.classList.add('current');

let pages = [
    { url: 'https://github.com/angela-shen', title: 'GitHub' },
    { url: '', title: 'Home' },
    { url: 'contact/', title: 'Contact' },
    { url: 'projects/', title: 'Projects' },
    { url: 'resume/', title: 'Resume' }
    // add the rest of your pages here
  ];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;
    // Create link and add it to nav
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    nav.append(a);
  }

  
const ARE_WE_HOME = document.documentElement.classList.contains('home');

url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

if (a.host === location.host && a.pathname === location.pathname) {
  a.classList.add('current');
}

a.classList.toggle(
  'current',
  a.host === location.host && a.pathname === location.pathname
);

a.target.toggle(
  '_blank',
  a.host != location.host
);

