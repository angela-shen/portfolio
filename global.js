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
  
let select = document.querySelector('label.color-scheme select')

select.addEventListener('input', function (event) {
  console.log('color scheme changed to', event.target.value);
  document.documentElement.style.setProperty('color-scheme', event.target.value);
  localStorage.colorScheme = event.target.value
});

if ("colorScheme" in localStorage) {
  document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme);
  select.value = localStorage.colorScheme
}

// lab 4 start

export async function fetchJSON(url) {
  try {
      // Fetch the JSON file from the given URL
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json();
    return data; 
  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
  }

}

export function renderProjects(project, containerElement, headingLevel = 'h2')  {
  // Your code will go here
  containerElement.innerHTML = '';
  for (let p of project) {
    const article = document.createElement('article'); 
    article.innerHTML = `
    <h3>${project.title}</h3>
    <img src="${project.image}" alt="${project.title}">
    <p>${project.description}</p>
    `;
    containerElement.appendChild(article);

  }
}
