# steemit.com

steemit.com is the web interface to the world's first and best
blockchain-based social media platform.  It uses
[STEEM](https://github.com/steemit/steem), a blockchain powered by Graphene
2.0 technology to store JSON-based content for a plethora of web
applications.

# Documentation

* Please see [CONTRIBUTORS](./doc/CONTRIBUTORS.md) for a full list of people
  who have contributed to this project.

# Tech Stack

* React
* Koa

# Why would I want to use Steemit.com?

* Learning how to build blockchain-based web applications using STEEM as a
  content storage mechanism in react.js
* Reviewing the inner workings of the steemit.com social media platform
* Assisting with software development for steemit.com

# Installation

## Clone the repository and make a tmp folder
```bash
git clone https://github.com/steemit/steemit.com
cd steemit.com
mkdir tmp
```

## Install dependencies

```bash
# Install at least Node v6.3 if you don't already have it ([NVM](https://github.com/creationix/nvm) recommended)
nvm install v6

npm install
npm install -g babel-cli
```

Install `sequelize-cli` globally:

```bash
npm install -g sequelize sequelize-cli pm2 mysql
```

Run `sequelize db:migrate` in `db/` directory.


# Development

```bash
npm start
```

You now have your development front end running at localhost:8080, connected
to the main public steem blockchain. You don't need to run ```steemd```
locally, by default you will connect to ```wss://steemit.com/wspa```.  Use your
regular account name and credentials to login -- there is no separate dev
login.

# Style Guides

## File naming and location

- Prefer CamelCase js and jsx file names
- Prefer lower case one word directory names
- Keep stylesheet files close to components
- Component's stylesheet file name should match component name

## Js & Jsx

We are using _Airbnb JavaScript Style Guide_ with some modifications (see
`.eslintrc`).  Please run `eslint` in the working directory before committing
your changes and make sure you didn't introduce any new styling issues.

## CSS & SCSS

If component requires a css rule, please use its uppercase name for the
class, e.g. "Header" class for the header's root div.  We adhere to BEM
methodology with exception for Foundation classes, here is an example for
the Header component:

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

# Issues

To report a non-critical issue, please file an issue on this GitHub project.

If you find a security issue please report details to: security@steemit.com

We will evaluate the risk and make a patch available before filing the issue.
