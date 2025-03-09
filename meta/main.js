let data = [];
let filteredCommits = [];
let newCommitSlice = [];

let NUM_ITEMS = 54; // Ideally, let this value be the length of your commit history
let ITEM_HEIGHT = 100; // Feel free to change
let VISIBLE_COUNT = 10; // Feel free to change as well
let totalHeight = (NUM_ITEMS - 1) * ITEM_HEIGHT;
const scrollContainer = d3.select('#scroll-container');
const spacer = d3.select('#spacer');
spacer.style('height', `${totalHeight}px`);
const itemsContainer = d3.select('#items-container');
scrollContainer.on('scroll', () => {
  const scrollTop = scrollContainer.property('scrollTop');
  let startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
  startIndex = Math.max(0, Math.min(startIndex, commits.length - VISIBLE_COUNT));
  renderItems(startIndex);
  calculateFiles();
  displayCommitFiles();
});

let maxfiles;
let fileHeight; 
let VISIBLE_COUNT_2 = 1;
let ITEM_HEIGHT_2 = 30;
let startIndex2;
let files = [];
const fileContainer = d3.select('#file-container');
const filespacer = d3.select('#file-spacer');
const fileitemsContainer = d3.select('#file-item-container');

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  //sliderEdits();
  displayCommitFiles();
  updateScatterplot(commits);
  brushSelector();
  displayCommitFiles();
});

function calculateFiles() {
  
  let lines = newCommitSlice.flatMap((d) => d.lines);
  
  files = d3
    .groups(lines, (d) => d.file)
    .map(([name, lines]) => {
      return { name, lines };
    });
  maxfiles = files.length;
  fileHeight = (maxfiles - 1) * ITEM_HEIGHT_2;
  filespacer.style('height', `${fileHeight}px`);
  fileContainer.on('scroll', () => {
    const fileTop = fileContainer.property('scrollTop');
    startIndex2 = Math.floor(fileTop / ITEM_HEIGHT_2);
    startIndex2 = Math.max(0, Math.min(startIndex2, files.length - VISIBLE_COUNT_2));
    renderFiles(startIndex2, files);
  });
}

function filterCommitsByTime(commitMaxTime) {
  filteredCommits = commits.filter((d) => d.datetime < commitMaxTime);
  //console.log(filteredCommits);
}

function sliderEdits() {
  let commitProgress = 100;
  //console.log(commits)
  let timeScale = d3.scaleTime([d3.min(commits, d => d.datetime), d3.max(commits, d => d.datetime)], [0, 100]);
  let commitMaxTime = timeScale.invert(commitProgress);

  const slider = document.getElementById('#slider');

  const selectedTime = document.getElementById('#selected-time');
  selectedTime.textContent = commitMaxTime.toLocaleString('en-US', { timeStyle: 'short', dateStyle: "long"});
  //console.log(selectedTime)

  function updateTimeDisplay() {
    commitProgress = Number(slider.value);
    commitMaxTime = timeScale.invert(commitProgress);
    selectedTime.textContent = commitMaxTime.toLocaleString('en-US',  { timeStyle: 'short', dateStyle: "long"});
    //console.log(selectedTime)
    filterCommitsByTime(commitMaxTime);
    updateScatterplot(filteredCommits);
    brushSelector();
    let lines = filteredCommits.flatMap((d) => d.lines);
    
    let fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);
    let files = [];
    files = d3
      .groups(lines, (d) => d.file)
      .map(([name, lines]) => {
        return { name, lines };
      });
  
    d3.select('.files').selectAll('div').remove(); // don't forget to clear everything first so we can re-render
    let filesContainer = d3.select('.files').selectAll('div').data(files).enter().append('div');
    
    filesContainer.append('dt').append('code').text(d => d.name); // TODO
    filesContainer.append('dd').attr('id', 'files')
    .selectAll('div')
    .data(d => d.lines)
    .enter()
    .append('div')
    .attr('class', 'line')
    .style('background', d => fileTypeColors(d.type)); // TODO
  }

  //slider.addEventListener('input', updateTimeDisplay);
  slider.addEventListener('input', updateTimeDisplay);
}


let commits = d3.groups(data, (d) => d.commit);

function processCommits() {
  commits = d3
  .groups(data, (d) => d.commit)
  .map(([commit, lines]) => {
    let first = lines[0];
    let { author, date, time, timezone, datetime } = first;
    let ret = {
      id: commit,
      url: 'https://github.com/angela-shen/portfolio/commit/' + commit,
      author,
      date,
      time,
      timezone,
      datetime,
      hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
      totalLines: lines.length,
    };

    Object.defineProperty(ret, 'lines', {
      enumerable: true,
      writable: true,
      configurable: true,
      value: lines,
    });

    return ret;
  });
}

function displayStats() {
  // Process commits first
  processCommits();

  // Create the dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Add total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Add longest file length
  dl.append('dt').text('Longest file (in LOC)');
  dl.append('dd').text(d3.max(data, (d) => d.line));

  // Add average file length
  dl.append('dt').text('Average file length (in LOC)');
  dl.append('dd').text(d3.mean(data, (d) => d.line));

  //time most work is done
  const workByPeriod = d3.rollups(
    data,
    (v) => v.length,
    (d) => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
  );
  const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
  dl.append('dt').text('Time of day most work is done:');
  dl.append('dd').text(maxPeriod);
  
  // Add more stats as needed...
}

async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
  // original function as before
  displayStats();
}

let xScale = null;
let yScale = null;

function updateScatterplot(filteredCommits) {
  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
  const width = 1000;
  const height = 600;

  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  d3.select('svg').remove(); // first clear the svg
  const svg = d3.select('#chart').append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

    xScale = d3.scaleTime().domain(d3.extent(filteredCommits, (d) => d.datetime))
    .range([0, width])
    .nice();

  yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

  // Update scales with new ranges
  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);

  svg.selectAll('g').remove(); // clear the scatters in order to re-draw the filtered ones
  const dots = svg.append('g').attr('class', 'dots');

  // Add gridlines BEFORE the axes
  const gridlines = svg
  .append('g')
  .attr('class', 'gridlines')
  .attr('transform', `translate(${usableArea.left}, 0)`);

  // Create gridlines as an axis with no labels and full-width ticks
  gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

  // Create the axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
  .axisLeft(yScale)
  .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

  // Add X axis
  svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

  // Add Y axis
  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

  

  const [minLines, maxLines] = d3.extent(filteredCommits, (d) => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines])
  .range([2, 30]);

  dots.selectAll('circle').remove(); 

  dots.selectAll('circle').data(filteredCommits).join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('fill', 'steelblue')
    .attr('r', (d) => rScale(d.totalLines))
    .style('fill-opacity', 0.7) // Add transparency for overlapping dots
    .on('mouseenter', (event, commit) =>  {
      d3.select(event.currentTarget).classed('selected', true).style('fill-opacity', 1);
      updateTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    }).on('mouseleave', (event, commit) =>  {
      d3.select(event.currentTarget).classed('selected', false).style('fill-opacity', 0.7);
      updateTooltipContent({}); // Clear tooltip content
      updateTooltipVisibility(false);
    });

}

function createScatterplot() {
  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
  const width = 1000;
  const height = 600;

  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

  yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

  // Update scales with new ranges
  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);

  // Add gridlines BEFORE the axes
  const gridlines = svg
  .append('g')
  .attr('class', 'gridlines')
  .attr('transform', `translate(${usableArea.left}, 0)`);

  // Create gridlines as an axis with no labels and full-width ticks
  gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

  // Create the axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
  .axisLeft(yScale)
  .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

  // Add X axis
  svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

  // Add Y axis
  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3
  .scaleSqrt() // Change only this line
  .domain([minLines, maxLines])
  .range([2, 30]);
  
  const dots = svg.append('g').attr('class', 'dots');

  dots.selectAll('circle').data(sortedCommits).join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('fill', 'steelblue')
    .attr('r', (d) => rScale(d.totalLines))
    .style('fill-opacity', 0.7) // Add transparency for overlapping dots
    .on('mouseenter', (event, commit) =>  {
      d3.select(event.currentTarget).style('fill-opacity', 1);
      updateTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    }).on('mouseleave', function () {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipContent({}); // Clear tooltip content
      updateTooltipVisibility(false);
    });

}

function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');

  if (Object.keys(commit).length === 0) {
    link.href = '';
    link.textContent = '';
    date.textContent = '';
  };

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}

function brushSelector() {
  const svg = document.querySelector('svg');
    // Create brush
  d3.select(svg).call(d3.brush());

  // Raise dots and everything after overlay
  d3.select(svg).selectAll('.dots, .overlay ~ *').raise();

  // Update brush initialization to listen for events
  d3.select(svg).call(d3.brush().on('start brush end', brushed));
}

let brushSelection = null;

function brushed(event) {
  brushSelection = event.selection;
  updateSelection();
  updateSelectionCount();
  updateLanguageBreakdown();
}

function isCommitSelected(commit) {
  if (!brushSelection) {
    return false;
  }
  // TODO: return true if commit is within brushSelection
  // and false if not
  const min = { x: brushSelection[0][0], y: brushSelection[0][1] }; 
  const max = { x: brushSelection[1][0], y: brushSelection[1][1] }; 
  const x = xScale(commit.date); const y = yScale(commit.hourFrac); 
  return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
}

function updateSelection() {
  // Update visual state of dots based on selection
  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
  const selectedCommits = brushSelection
    ? filteredCommits.filter(isCommitSelected)
    : [];

  const countElement = document.getElementById('selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
}

function updateLanguageBreakdown() {
  const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];
  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }
  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  // Use d3.rollup to count lines per language
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type
  );

  // Update DOM with breakdown
  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${formatted})</dd>
        `;
  }

  return breakdown;
}

function renderItems(startIndex) {
  // Clear things off
  itemsContainer.selectAll('div').remove();
  const endIndex = Math.min(startIndex + VISIBLE_COUNT, commits.length);
  newCommitSlice = commits.slice(startIndex, endIndex);
  // Update the scatterplot with the new slice
  updateScatterplot(newCommitSlice);
  brushSelector();
  // Re-bind the commit data to the container and represent each using a div
  itemsContainer.selectAll('div')
                .data(newCommitSlice)
                .enter()
                .append('div')
                .html((commit, index) => {
                  const fileCount = d3.rollups(commit.lines, d => d.length, d => d.file).length;
                  return `
                    <p>
                      On ${commit.datetime.toLocaleString("en", { dateStyle: "full", timeStyle: "short" })}, I made
                      <a href="${commit.url}" target="_blank">
                        ${index > 0 ? 'another commit, continuing my labs' : 'my first commit of the quarter.'}
                      </a>. I edited ${commit.totalLines} lines across ${fileCount} files. ${commit.totalLines > 10 ? 'Light work.' : 'A grueling task.'}
                    </p>
                  `;
                })
                .style('position', 'absolute')
                .style('top', (_, idx) => `${(startIndex + idx) * ITEM_HEIGHT}px`);
}

function renderFiles(startIndex2, files){
  // Clear things off
  fileitemsContainer.selectAll('div').remove();
  const endIndex = Math.min(startIndex2 + VISIBLE_COUNT_2, files.length);
  let newfileSlice = files.slice(startIndex2, endIndex);
  // Re-bind the file data to the container and represent each using a div
  fileitemsContainer.selectAll('div')
                .data(newfileSlice)
                .enter()
                .append('div')
                .html((file) => {
                  return `
                    <p>
                      File: ${file.name} - ${file.lines.length} lines
                      That's a lot of lines!
                    </p>
                  `;
                })
                .style('position', 'absolute')
                .style('top', (_, idx) => `${(startIndex2 + idx) * ITEM_HEIGHT_2}px`);
}

function displayCommitFiles() {
  const lines = newCommitSlice.flatMap((d) => d.lines);
  let fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);
  let files = d3.groups(lines, (d) => d.file).map(([name, lines]) => {
    return { name, lines };
  });
  files = d3.sort(files, (d) => -d.lines.length);

  //console.log(files)
  d3.select('.files').selectAll('div').remove();
  let filesContainer = d3.select('.files').selectAll('div').data(files).enter().append('div');
  filesContainer.append('dt').attr('id', 'files').html(d => `<code>${d.name}</code><small>${': ' + d.lines.length} lines</small>`);
  filesContainer.append('dd').attr('id', 'files')
                .selectAll('div')
                .data(d => d.lines)
                .enter()
                .append('div')
                .attr('class', 'line')
                .style('background', d => fileTypeColors(d.type));
}