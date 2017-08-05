# Steemit.com


Steemit.com is the react.js web interface to the world's first and best blockchain-based social media platform.  It uses [STEEM](https://github.com/steemit/steem), a blockchain powered by Graphene 2.0 technology to store JSON-based content for a plethora of web applications.   

## Why would I want to use Steemit.com?
* Learning how to build blockchain-based web applications using STEEM as a content storage mechanism in react.js
* Reviewing the inner workings of the steemit.com social media platform
* Assisting with software development for steemit.com

## Installation

#### Install yarn if not already installed

```bash
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
(enter password)
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn
```

#### OS X: Install brew if not already installed

```bash
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

#### Install Node v6.3 (or above) if not already installed ([NVM](https://github.com/creationix/nvm) recommended)

```bash
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm

command -v nvm # verify it outputs nvm

nvm install v6
```

#### Clone the repository and make a tmp folder
```bash
git clone https://github.com/steemit/condenser
cd condenser
mkdir tmp
```

#### Create config file

```bash
cd config
cp default.json steem-dev.json
cd ..
```

#### Generate a new crypto_key and save under server_session_secret in `./config/steem-dev.json`.

```bash
node
> crypto.randomBytes(32).toString('base64')
> .exit
```

(note: it's steem.json in production)

#### Install mysql server

OS X:

```bash
brew update
brew doctor
brew upgrade
brew install mysql
mysql.server restart
```

Debian based Linux:

```bash
sudo apt-get update
sudo apt-get install mysql-server
```

#### Save password in config

Edit `~/condenser/src/db/config/config.json` 
Save the mysql password under `"password"`.

#### Launch mysql client and create steemit_dev database:

```bash
mysql -u root -p
(enter password)
> create database steemit_dev;
> quit
```

#### Install sequelize and mysql2:

```bash
yarn add sequelize
yarn add mysql2
```

#### Install Tarantool - Production Only

OS X:

```bash
brew install tarantool
```

Debian based Linux:

```bash
sudo apt-get install tarantool
```

Test the interactive console:

```bash
user@example:~$ tarantool
```

#### Install all the dependencies of the project

```bash
yarn install
```

#### Launch (Development)

```bash
yarn start
```

It will take a few moments to launch. Once it says "Application started on port ####", you now have your development front end running at localhost:####, connected to the main public steem blockchain. It may output some SQL commands after that too, so you may need to scroll up to verify. You don't need to run ```steemd``` locally, by default you will connect to ```ws://node.steem.ws```.  Use your regular account name and credentials to login -- there is no separate dev login.

#### Launch (Production)

If you want to test it locally in production mode, just run the following commands:

```bash
yarn build
yarn production
```

or via pm2:

```bash
npm run build
npm -i -g pm2 # one time
pm2 start config/process.json
```

## Troubleshooting

#### On Ubuntu 16.04+ you may be unable to connect to mysql without root access. 

If so update the mysql root user as follows::

```bash
sudo mysql -u root
DROP USER 'root'@'localhost';
CREATE USER 'root'@'%' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';
FLUSH PRIVILEGES;
```

#### If the database connection is not working, double check these settings

Edit `~/condenser/config/default.json` and enter this string for database:

```bash
"database_url": "mysql://root:password@127.0.0.1/steemit_dev"
```

Edit `~/condenser/.babelrc` if it doesn't look like the following: 

```bash
{

  "presets": ["es2015", "stage-0", "react"],

  "plugins": ["transform-runtime", "transform-decorators-legacy"]

}
```

Add an env var for the database in your shell:

`touch ~/.bash_profile`

Add 1 line to `~/.bash_profile`:
```bash
export SDC_DATABASE_URL="mysql://root:password@localhost/steemit_dev"
```

Then run:
```bash
source ~/.bash_profile`
```

#### How to create a password for the root mysql account:

`mysql_secure_installation`

(answer all it's questions as No, with Enter key, except to add a password, use "password")

## Style Guides

##### File naming and location

- Prefer CamelCase js and jsx file names
- Prefer lower case one word directory names
- Keep stylesheet files close to components
- Component's stylesheet file name should match component name

##### Js & Jsx
We are using _Airbnb JavaScript Style Guide_ with some modifications (see .eslintrc).
Please run _eslint_ in the working directory before committing your changes and make sure you didn't introduce any new styling issues.

##### CSS & SCSS
If component requires a css rule, please use its uppercase name for the class, e.g. "Header" class for the header's root div.
We adhere to BEM methodology with exception for Foundation classes, here is an example for the Header component:

```html
<!-- Block -->
<ul class="Header">
  ...
  <!-- Element -->
  <li class="Header__menu-item">Menu Item 1</li>
  <!-- Element with modifier -->
  <li class="Header__menu-item--selected">Element with modifier</li>
</ul>
```

## Issues

To report a non-critical issue, please file an issue on this GitHub project.

If you find a security issue please report details to: security@steemit.com

We will evaluate the risk and make a patch available before filing the issue.
