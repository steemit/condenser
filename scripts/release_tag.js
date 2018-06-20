const child = require('child_process');
const inquirer = require('inquirer');

async function run() {
    await asyncExec('git fetch --tags');
    const { stdout, stderr } = await asyncExec('git tag');

    if (stderr) {
        console.error(stderr);
        process.exit(1);
    }

    const versions = new Map();

    const tags = stdout
        .split(/\n+/)
        .map(tag => tag.trim())
        .filter(tag => tag.length);

    for (let tag of tags) {
        const match = tag.match(/^(\d+)\.(\d+)/);

        if (match) {
            const major = Number(match[1]);
            const minor = Number(match[2]);

            if (major > 0) {
                const info = versions.get(major);

                if (!info || info.minor < minor) {
                    versions.set(major, {
                        minor,
                        tag,
                    });
                }
            }
        }
    }

    const orderedVersions = [...versions.keys()].sort();

    const options = orderedVersions.map(version => {
        const { minor, tag } = versions.get(version);

        return `${`${version}.${minor + 1}`.padEnd(
            10,
            ' '
        )} latest tag: ${tag}`;
    });

    const result = await inquirer.prompt([
        {
            type: 'list',
            name: 'version',
            message: 'Which version do you want to use?',
            choices: options,
            default: options[options.length - 1],
        },
        {
            type: 'list',
            name: 'type',
            message: 'Which type of tag?',
            choices: ['--EMPTY--', 'SANDBOX', 'RC'],
            default: 'SANDBOX',
        },
        {
            type: 'input',
            name: 'Enter the comment',
            validate(msg) {
                if (msg.length > 0) {
                    return true;
                }

                return 'Required';
            },
        },
    ]);

    const index = options.findIndex(o => o === result.version);

    const ver = orderedVersions[index];
    const minor = versions.get(ver).minor + 1;

    let tagName = `${ver}.${minor}`;

    if (result.type && result.type !== '--EMPTY--') {
        tagName += '.' + result.type;
    }

    const commands = [
        `git tag -a '${tagName}' -m '${result.comment}'`,
        `git push origin '${tagName}'`,
    ];

    const confirm = await inquirer.prompt({
        message: `Do you want to execute?\n${commands.join(' && ')}`,
        type: 'confirm',
        name: 'ok',
    });

    if (confirm.ok) {
        for (let command of commands) {
            const { stdout, stderr } = await asyncExec(command);

            if (stderr) {
                console.error(stderr);
                process.exit(1);
            } else {
                console.log(stdout);
            }
        }
    }
}

function asyncExec(command) {
    return new Promise((resolve, reject) => {
        child.exec(command, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}

run().catch(err => {
    console.error(err);
});
