import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

//lab 4
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const title = document.querySelector('h1.title')
title.innerText = projects.length + ' Projects'

//lab 5

let query = '';

let searchInput = document.querySelector('.searchBar');

//let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
//let arc = arcGenerator({
//    startAngle: 0,
//    endAngle: 2 * Math.PI,
//  });

//d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');

/*let rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year,
);

let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
});

let total = 0;
let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));

for (let d of data) {
  total += d;
}
let angle = 0;
//let arcData = [];

for (let d of data) {
  let endAngle = angle + (d / total) * 2 * Math.PI;
  arcData.push({ startAngle: angle, endAngle });
  angle = endAngle;
}

//let arcs = arcData.map((d) => arcGenerator(d));

let colors = d3.scaleOrdinal(d3.schemeTableau10);

arcs.forEach((arc, idx) => {
    d3.select('svg')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx)) // Fill in the attribute for fill color via indexing the colors variable
})

let legend = d3.select('.legend');
data.forEach((d, idx) => {
    legend.append('li')
          .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
          .attr('class', `legend-items`)
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
})

searchInput.addEventListener('change', (event) => {
    
  // update query value
  query = event.target.value;
  // TODO: filter the projects
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  // TODO: render updated projects!
  renderProjects(filteredProjects, projectsContainer, 'h2');

});*/

let selectedIndex = -1;


// Refactor all plotting into one function
function renderPieChart(projectsGiven) {
    // re-calculate rolled data
    //console.log(projectsGiven)
    let newRolledData = d3.rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year,
    );
    // re-calculate data
    let newData = newRolledData.map(([year, count]) => {
        return { value: count, label: year };
    });
    // re-calculate slice generator, arc data, arc, etc.
    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let newArcs = newArcData.map((d) => arcGenerator(d));
    // TODO: clear up paths and legends
    let newSVG = d3.select('svg'); 
    newSVG.selectAll('path').remove();  
    let newLegend = d3.select('.legend')
    newLegend.selectAll('li').remove();  
    // update paths and legends, refer to steps 1.4 and 2.2
    let total = 0;
    for (let d of newData) {
        total += d;
    }

    let angle = 0;
    //let arcData = [];
      
    for (let d of newData) {
        let endAngle = angle + (d / total) * 2 * Math.PI;
        newArcData.push({ startAngle: angle, endAngle });
        angle = endAngle;
    }
    
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    newData.forEach((d, idx) => {
        newLegend.append('li')
              .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
              .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
    })

    newArcs.forEach((arc, idx) => {
        newSVG.append('path')
        .attr('d', arc)
        .attr('fill', colors(idx)) // Fill in the attribute for fill color via indexing the colors variable 
        .on('click', () => {
            selectedIndex = selectedIndex === idx ? -1 : idx;
            //console.log(selectedIndex);
            newSVG
                .selectAll('path')
                .attr('class', (_, idx) => (
                // TODO: filter idx to find correct pie slice and apply CSS from above
                idx === selectedIndex ? 'selected' : '_'
            ));

            newLegend
                .selectAll('li')
                .attr('class', (_, idx) => (
                // TODO: filter idx to find correct legend and apply CSS from above
                idx === selectedIndex ? 'selected' : '_'
            ));
            if (selectedIndex === -1) {
                renderProjects(projectsGiven, projectsContainer, 'h2');
              } else {
                // TODO: filter projects and project them onto webpage
                // Hint: `.label` might be useful
                let year = 0;
                newData.forEach((d, idx) => {
                    year = idx === selectedIndex ? d.label : year;
                });
                let filteredProjects = projectsGiven.filter(p => p.year === year)
                //console.log(filteredProjects)
                /*let filteredProjects = projects.filter((project) => {
                    let values = Object.values(project).join('\n').toLowerCase();
                    return values.includes(query.toLowerCase());
                });*/
                renderProjects(filteredProjects, projectsContainer, 'h2');
              }
        });
    })
}


/*
let selectedIndex = -1;

let svg = d3.select('svg');
svg.selectAll('path').remove();
arcs.forEach((arc, i) => {
svg
    .append('path')
    .attr('d', arc)
    .attr('fill', colors(i))
});

*/
// Call this function on page load
renderPieChart(projects);

searchInput.addEventListener('change', (event) => {
    // update query value
    query = event.target.value;
    // TODO: filter the projects
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });
    // re-render legends and pie chart when event triggers
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});

/*
let rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year,
);

let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
});

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));
let colors = d3.scaleOrdinal(d3.schemeTableau10);
*/

