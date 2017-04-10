# Golos.io

========
Golos.io is the react.js web interface to the world's first and best blockchain-based social media platform.  It uses [STEEM/Golos](https://github.com/GolosChain/golos), a fork of Steem/Steemit blockchain powered by Graphene 2.0 technology to store JSON-based content for a plethora of web applications.   

## Why would I want to use Golos.io?
* Learning how to build blockchain-based web applications using STEEM/Golos as a content storage mechanism in react.js
* Reviewing the inner workings of the golos.io social media platform
* Assisting with software development for golos.io

## Installation

#### Clone the repository and make a tmp folder
```bash
git clone https://github.com/GolosChain/tolstoy
cd tolstoy
mkdir tmp
```

#### Install dependencies

```bash
# Install at least Node v6.3 if you don't already have it ([NVM](https://github.com/creationix/nvm) recommended)
sudo nvm install v6

npm install
sudo npm install -g babel-cli
```

#### Create config file


```bash
cd config
cp example/client-example.js client_config.js
cp example/golos-example.json golos-dev.json
cp example/golos-example.json golos.json
```

Generate a new crypto_key and save under server_session_secret in ./golos-dev.json.

```bash
node
> crypto.randomBytes(32).toString('base64')
```

(note: it's golos.json in production)

#### Install mysql server

OS X :

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
mysql -u root
> DROP USER 'root'@'localhost';
> CREATE USER 'root'@'%' IDENTIFIED BY '';
> GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';
> FLUSH PRIVILEGES;
```

Now launch mysql client and create golos_dev database:
```bash
mysql -u root
> create database golos_dev;
```

Install `sequelize-cli` globally:

```bash
sudo npm install -g sequelize sequelize-cli mysql
```

Run `sequelize db:migrate` in `db/` directory.


### Development

```bash
npm start
```

You now have your development front end running at localhost:3002, connected to the main public golos blockchain. You don't need to run ```golos``` locally, by default you will connect to ```wss://ws.golos.io```.  Use your regular account name and credentials to login -- there is no separate dev login.

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
sudo npm install -g pm2 # one time
cp example/process-example.json process.json
pm2 start config/process.json
```


## Issues

To report a non-critical issue, please file an issue on this GitHub project.

If you find a security issue please report details to: https://github.com/GolosChain/tolstoy/issues

We will evaluate the risk and make a patch available before filing the issue.
