// noinspection JSCheckFunctionSignatures,JSUnresolvedFunction

const AdmZip = require('adm-zip')
const path = require('path')
const fs = require('fs')

const gitRemoteOriginUrl = require('remote-origin-url')
const parseGithubUrl = require('parse-github-url')
const gitBranch = require('git-branch')

const packPath = process.argv[2]

if (path == null) console.log("Please provide a path.")
else {
    const list = []
    const files = fs.readdirSync(packPath).filter(file => file.endsWith(".zip") || file.endsWith(".pack"))
    for (const pack of files) {
        const zip = new AdmZip(path.join(packPath, pack))
        const metaFile = zip.getEntry('pack.meta')
        const gitUrl = parseGithubUrl(gitRemoteOriginUrl.sync())
        gitUrl.branch = gitBranch.sync()
        const meta = {
            url: `https://github.com/${gitUrl.repo}/raw/${gitUrl.branch}/${packPath}/${pack}`,
            author: 'Rboard Script',
            tags: []
        }
        if (metaFile != null) {
            const tmp = metaFile.getData().toString()
            tmp.split(new RegExp('(\r\n|\n)')).forEach(metaEntry => {
                if (metaEntry.includes('=')) {
                    meta[metaEntry.split('=')[0]] = metaEntry.includes(',') ? metaEntry.split('=')[1].split(',') : metaEntry.split('=')[1]
                }
            })
        } else {
            meta.name = pack.replace('_', ' ').replace(new RegExp('\.(zip|pack)'), '')
        }
        list.push(meta)
    }
    fs.writeFileSync('list.json', JSON.stringify(list, null, 2))
}