
# Condenser

Condenser is the react.js web interface to the world's first and best blockchain-based social media platform, steemit.com.  It uses [STEEM](https://github.com/steemit/steem), a blockchain powered by Graphene 2.0 technology to store JSON-based content for a plethora of web applications.   

## Why would I want to use Condenser (steemit.com front-end)?
* Learning how to build blockchain-based web applications using STEEM as a content storage mechanism in react.js
* Reviewing the inner workings of the steemit.com social media platform
* Assisting with software development for steemit.com

## Installation

#### Docker

We highly recommend using docker to run condenser. This is how we run the live steemit.com site and it is the most supported (and fastest) method of both building and running condenser. We will always have the latest version of condenser (master branch) available on dockerhub. Configuration settings can be set using environment variables (see configuration section below for more information). If you need to install docker, you can get it at https://get.docker.com

To bring up a running container it's as simple as this:

```bash
docker run -it -p 8080:8080 steemit/condenser
```

Environment variables can be added like this:

```bash
docker run -it --env SDC_DATABASE_URL="mysql://user:pass@hostname/databasename" -p 8080:8080 steemit/condenser
```

If you would like to modify, build, and run condenser using docker, it's as simple as pulling in the github repo and issuing one command to build it, like this:

```bash
git clone https://github.com/steemit/condenser
cd condenser
docker build -t="myname/condenser:mybranch" .
docker run -it -p 8080:8080 myname/condenser:mybranch
```

## Building from source without docker (the 'traditional' way):

#### Clone the repository and make a tmp folder
```bash
git clone https://github.com/steemit/condenser
cd condenser
mkdir tmp
```

#### Install dependencies

Install at least Node v7.5 if you don't already have it. We recommend using `nvm` to do this as it's both the simplest way to install and manage installed version(s) of node. If you need `nvm`, you can get it at [https://github.com/creationix/nvm](https://github.com/creationix/nvm).

Using nvm, you would install like this:
```bash
nvm install v7.5
```

We use the yarn package manager instead of the default `npm`. There are multiple reasons for this, one being that we have `steem-js` built from source pulling the github repo as part of the build process and yarn supports this. This way the library that handles keys can be loaded by commit hash instead of a version name and cryptographically verified to be exactly what we expect it to be. Yarn can be installed with `npm`, but afterwards you will not need to use `npm` further.

```bash
npm install -g yarn
yarn global add babel-cli
yarn install
yarn run build
```
To run condenser in production mode, run:

```bash
yarn run production
```

When launching condenser in production mode it will automatically use 1 process per available core. You will be able to access the front-end at http://localhost:8080 by default.

To run condenser in development mode, run:

```bash
yarn run start
```

It will take quite a bit longer to start in this mode (~60s) as it needs to build and start the webpack-dev-server.

By default you will be connected to steemit.com's public steem node at `wss://steemd.steeemit.com`. This is actually on the real blockchain and you would use your regular account name and credentials to login - there is not an official separate testnet at this time. If you intend to run a full-fledged site relying on your own, we recommend looking into running a copy of `steemd` locally instead [https://github.com/steemit/steem](https://github.com/steemit/steem).

#### Configuration

The intention is to configure condenser using environment variables. You can see the names of all of the available configuration environment variables in `config/custom-environment-variables.json`. Default values are stored in `config/defaults.json`.

Environment variables using an example like this:

```bash
export SDC_CLIENT_STEEMD_URL="wss://steemd.steemit.com"
export SDC_SERVER_STEEMD_URL="wss://steemd.steemit.com"
```
Keep in mind environment variables only exist in your active session, so if you wish to save them for later use you can put them all in a file and `source` them in.

If you'd like to statically configure condenser without variables you can edit the settings directly in `config/production.json`. If you're running in development mode, copy `config/production.json` to `config/dev.json` with `cp config/production.json config/dev.json` and adjust settings in `dev.json`.

If you're intending to run condenser in a production environment one configuration option that you will definitely want to edit is `server_session_secret` which can be set by the environment variable `SDC_SESSION_SECRETKEY`. To generate a new value for this setting, you can do this:

```bash
node
> crypto.randomBytes(32).toString('base64')
> .exit
```

#### Install mysql server

If you've followed the instructions up until this point you will already have a running condenser installation which is entirely acceptable for development purposes. It is *not required to run a SQL server for development*. If you're running a full-fledged site however, you will want to set one up.

Once set up, you can set the mysql server configuration option for condenser using the environment variable `SDC_DATABASE_URL`, or alternatively by editing it in `config/production.json`. You will use the format `mysql://user:pass@hostname/databasename`.

Example:

```bash
export SDC_DATABASE_URL="mysql://root:password@127.0.0.1/steemit_dev"
```

Here are instructions for setting up a mysql server and running the necessary migrations by operating system:

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
so update the mysql root user as follows:

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

#### Database migrations

This is a required step in order for the database to be 'ready' for condenser's use.

Install these modules globally:

```bash
yarn global add sequelize sequelize-cli pm2 mysql mysql2
```

Edit the file `src/db/config/config.json` using your favorite command line text editor being sure that the username, password, host, and database name are set correctly and match your newly configured mysql setup.

Run `sequelize db:migrate` in `src/db` directory, like this:

```bash
cd src/db
sequelize db:migrate
```

#### Install Tarantool - Production Only

Tarantool similarly to mysql is not required for development but if you're running a full-fledged site with condenser you will want to run one.

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

#### Style Guides For Submitting Pull Requests

##### File naming and location

- Prefer CamelCase js and jsx file names
- Prefer lower case one word directory names
- Keep stylesheet files close to components
- Component's stylesheet file name should match component name

##### Js & Jsx
We are using _Airbnb JavaScript Style Guide_ with some modifications (see .eslintrc).
Please run _eslint_ in the working directory before committing your changes and make sure you didn't introduce any new styling issues.

##### CSS & SCSS
If a component requires a css rule, please use its uppercase name for the class, e.g. "Header" class for the header's root div.
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
