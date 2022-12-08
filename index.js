const { promises: fs } = require('node:fs');
const { join } = require('node:path');

const core = require('@actions/core');
// const github = require('@actions/github');
const fetch = require('node-fetch-commonjs')


/**
 * 
 * @param {string} endpoint 
 * @param {string} username 
 * @param {string} password 
 * @param {string | object} config 
 * @returns {Promise<fetch.Response>}
 */
async function syncConfig(endpoint, username, password, config) {
    let body = config
    if (typeof body != 'string') {
        body = JSON.stringify(config)
    }
    const response = await fetch(endpoint, {
        method: 'post',
        body,
        headers: {
            'Authorization': `Basic ${Buffer.from(username + ":" + password).toString('base64')}`,
            'Content-Type': 'application/json'
        }
    })
    return response;
}

async function padWithFiles(config) {
    let body = JSON.parse(config);
    let newItems = [];
    let response = { appId: body["appId"] };
    for (index in body["items"]) {
      let item = body["items"][index];
      if ("path" in item) {
        let path = item["path"];
        try {
          let configDir = "~/workspace";
          const data = await fs.readFile(join(configDir, path), {encoding: "utf-8",});
          newItems.push({
            keySuffix: item["keySuffix"],
            value: data,
          });
        } catch (error) {
            core.setFailed(error.message);
        }
      } else newItems.push(item);
    }
    response["items"] = newItems;  
    return response;
  }


(async () => {
    try {
        const configDir = core.getInput('config-dir') || './config';
        const username = core.getInput('username');
        const password = core.getInput('password');
        const endpoint = core.getInput('endpoint');

        const files = await fs.readdir(configDir, {
            withFileTypes: true
        })

        // @TODO use parallelization here
        for (const file of files) {
            if (file.isFile && file.name.includes('.json')) {
                const data = await fs.readFile(join(configDir, file.name), { encoding: 'utf-8' })
                const afterCheckPath = await padWithFiles(data)
                const afterCheckPathStr = JSON.stringify(afterCheckPath)
                const response = await syncConfig(endpoint, username, password, afterCheckPathStr)
                if (response.status > 299) {
                    throw new Error(`Failed with http code ${result.statusCode}`)
                }
            }
        }
        core.setOutput('status', 'done')
    } catch (error) {
        core.setFailed(error.message);
    }
})()