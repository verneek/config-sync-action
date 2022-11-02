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
                const response = await syncConfig(endpoint, username, password, data)
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