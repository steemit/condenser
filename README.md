
# Steemit.com


Steemit.com is the react.js web interface to the world's first and best blockchain-based social media platform.  It uses [STEEM](https://github.com/steemit/steem), a blockchain powered by Graphene 2.0 technology to store JSON-based content for a plethora of web applications.   

## Why would I want to use Steemit.com?
* Learning how to build blockchain-based web applications using STEEM as a content storage mechanism in react.js
* Reviewing the inner workings of the steemit.com social media platform
* Assisting with software development for steemit.com

## Installation

#### Clone the repository and make a tmp folder
```bash
git clone https://github.com/steemit/condenser
cd condenser
mkdir tmp
```

#### Verify NVM is installed

```bash
command -v nvm # verify
```

It should output "nvm". If it does not, install nvm.

#### Install dependencies

```bash
# Install at least Node v6.3 if you don't already have it ([NVM](https://github.com/creationix/nvm) recommended)
nvm install v6

npm install
npm install -g babel-cli
```

#### Create config file


```bash
cd config
cp default.json steem-dev.json
```

Generate a new crypto_key and save under server_session_secret in ./steem-dev.json.

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

On Ubuntu 16.04+ you may be unable to connect to mysql without root access, if
so update the mysql root user as follows::

```
sudo mysql -u root
DROP USER 'root'@'localhost';
CREATE USER 'root'@'%' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';
FLUSH PRIVILEGES;
```

Now launch mysql client and create steemit_dev database:
```bash
mysql -u root
> create database steemit_dev;
> quit
```

Create a password for the root mysql account:

mysql_secure_installation

(answer all it's questions as No, with Enter key, except to add a password, use "password")


Install `sequelize-cli` globally:

```bash
npm install -g sequelize sequelize-cli pm2 mysql
```

###### Edit the following files and make these changes:

Edit `~/condenser/db/config/config.json` and save the mysql password under "password".

Edit `~/condenser/config/default.json` and enter this string for database:

"database_url": "mysql://root:password@127.0.0.1/steemit_dev"

Edit `~/condenser/.babelrc if it doesn't look like the following: 

{

  "presets": ["es2015", "stage-0", "react"],

  "plugins": ["transform-runtime", "transform-decorators-legacy"]

}


###### IMPORTANT: Add an env var for the database as well in your shell:

touch ~/.bash_profile
edit this file, add 1 line:

`export SDC_DATABASE_URL="mysql://root:password@localhost/steemit_dev"`

source ~/.bash_profile

globally install sql2:

npm i -g mysql2



Run `sequelize db:migrate` in `db/` directory.

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

### Development

```bash
npm start
```

It will take a few moments to launch. Once it says "Application started on port ####", you now have your development front end running at localhost:####, connected to the main public steem blockchain. You don't need to run ```steemd``` locally, by default you will connect to ```ws://node.steem.ws```.  Use your regular account name and credentials to login -- there is no separate dev login.

#### Style Guides

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

### Production

If you want to test it locally in production mode, just run the following commands:

```bash
npm run build
npm run prod
```

or via pm2:

```bash
npm run build
npm -i -g pm2 # one time
pm2 start config/process.json
```


## Issues

To report a non-critical issue, please file an issue on this GitHub project.

If you find a security issue please report details to: security@steemit.com

We will evaluate the risk and make a patch available before filing the issue.
