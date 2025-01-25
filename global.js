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
    const ARE_WE_HOME = document.documentElement.classList.contains('home');

    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;
    // Create link and add it to nav
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    if (a.host === location.host && a.pathname === location.pathname) {
      a.classList.add('current');
    }
    if (a.host != location.host) {
      a.target = "_blank";
    }
    nav.append(a);
  }

  document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
      Theme:
      <select>
        <option value = 'light dark'>Automatic</option>
        <option value = 'light'>Light</option>
        <option value = 'dark'>Dark</option>
      </select>
    </label>`
  );
  