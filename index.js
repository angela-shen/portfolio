import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';
const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);
const projectsContainer = document.querySelector('.projects');
renderProjects(latestProjects, projectsContainer, 'h2');

const githubData = await fetchGitHubData('angela-shen');
const profileStats = document.querySelector('#profile-stats');
if (profileStats) {
  profileStats.innerHTML = `
    <dl>
    <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
    <dt>Followers:</dt><dd>${githubData.followers}</dd>
    <dt>Following:</dt><dd>${githubData.following}</dd>
    <dt>Bio:</dt><dd>${githubData.bio}</dd>
    </dl>
  `;
}