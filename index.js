const core = require('@actions/core');
const exec = require('@actions/exec').exec;
const github = require('@actions/github');


// Install OdinPlus Mod Uploader
async function run(){
  try{
    await exec('dotnet tool install -g Digitalroot.OdinPlusModUploader')
    .catch((error) => core.setFailed(error));


    // Get inputs
    const modId = core.getInput('mod-id');
    const archiveFile = core.getInput('archive-file');
    const fileName = core.getInput('file-name');
    const version = core.getInput('version');
    const category = core.getInput('category');
    const description = core.getInput('description');
    const game = core.getInput('game');
    const namespace = core.getInput('namespace');
    const tomlConfigPath = core.getInput('tomlConfigPath');
    // Set environment variables from repository secrets
    const apiKey = core.getInput('NEXUSMOD_API_KEY');
    const cookieNexusId = core.getInput('NEXUSMOD_COOKIE_NEXUSID');
    const cookieSidDevelop = core.getInput('NEXUSMOD_COOKIE_SID_DEVELOP');
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');

    // Upload mod to NexusMods
    await exec('opmu', ['nexusmods', 'check', `-k`, `${apiKey}`, `-cnxid`, `${cookieNexusId}`, `-csid`, `${cookieSidDevelop}`])
          .catch((error) => core.setFailed(error));

    await exec('opmu', ['nexusmods', 'upload', `${modId}`, `${archiveFile}`, 
                      `-f`, `${fileName}-${version}`,
                       `-v`, `${version}`,
                       `-g`, `${game}`,
                        `-t`, `${category}`,
                        `-d`, `"${description}"`,
                        `-k`, `${apiKey}`,
                        `-cnxid`, `${cookieNexusId}`,
                        `-csid`, `${cookieSidDevelop}`
                        ])
                        .catch((error) => core.setFailed(error));

    // Create a new comment on the commit with the upload result
    const octokit = github.getOctokit(GITHUB_TOKEN);
    const { owner, repo } = github.context.repo;
    const { sha } = github.context.sha;
    const comment = `Successfully uploaded mod to NexusMods: ${version}`;

    await octokit.rest.repos.createCommitComment({ owner, repo, sha, body: comment })
          .catch((error) => core.setFailed(error))

  } catch (error){
    core.setFailed(error);
  }
}

run();
