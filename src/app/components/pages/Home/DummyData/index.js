import mockData from './output';

const titles = ['Physicist', 'Researcher', 'Engineer', 'Student', 'Teacher'];
const labels = [
  'Math',
  'Computer',
  'Physics',
  'Art',
  'Machine',
  'English',
  'Science',
];

const titleCount = titles.length;
const labelCount = labels.length;

function getTitle(index) {
  return titles[index % titleCount];
}

function getLabel(index) {
  return labels[index % labelCount];
}

function getLabels() {
  const count = parseInt(Math.random() * labelCount);
  const ret = [];
  let index = 0;
  while (ret.length < count && index < labelCount) {
    const rand = parseInt(Math.random() * labelCount);
    if (rand % 2 === 0) {
      ret.push(labels[index]);
    }
    index += 1;
  }
  return ret;
}

function randomVote() {
  const rand = parseInt(Math.random() * 7);
  if (rand === 1) return 'up';
  if (rand === 4) return 'down';
  return null;
}

function dateFormat(date) {
  const month_names = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const day = date.getDate();
  const month_index = date.getMonth();
  const year = date.getFullYear();
  return `${month_names[month_index]} ${day}, ${year}`;
}

function getNick(name) {
  return name.replace(/\s+/g, '-').toLowerCase();
}

const dictionary = {};

export const MockItems = mockData.map((item, index) => {
  const mockItem = {
    id: item.ID,
    title: item.Title,
    type: item.Post_type,
    label: getLabel(index),
    labels: getLabels(),
    user: {
      name: item.Author,
      nick: getNick(item.Author),
      title: getTitle(index),
    },
    votes: {
      up: parseInt(item.Upvotes),
      down: parseInt(item.Downvotes),
      you: randomVote(),
    },
    from: {
      id: item.Originated_From,
      type: item.Type_of_Post_it_Originated_from,
    },
    date: dateFormat(new Date(item.Date)),
    reviews: item.Reviews,
    info: {
      kScore: item.Kscore,
      awarded: item.NLG_Awarded,
      DOI: item.DOI,
    },
  };

  const citesCount = item.Cites;
  const cites = [];
  for (let i = 1; i <= citesCount; i += 1) {
    cites.push(item['Citation_' + i.toString()]);
  }

  if (!dictionary[mockItem.id]) {
    dictionary[mockItem.id] = { citedBy: [] };
  }

  dictionary[mockItem.id].data = mockItem;
  dictionary[mockItem.id].cites = cites;

  cites.forEach(citedId => {
    if (!dictionary[citedId]) {
      dictionary[citedId] = { citedBy: [] };
    }
    if (!dictionary[citedId].citedBy.find(a => a === mockItem.id)) {
      dictionary[citedId].citedBy.push(mockItem.id);
    }
  });

  return mockItem;
});

export const MockItemDictionary = dictionary;

export const SearchItems = [
  {
    id: 1,
    title: 'Who’s really pushing ‘bad science’?',
    type: 'H',
    user: {
      name: 'Joe Sample',
      title: 'Physicist',
    },
    votes: {
      up: 152,
      down: 2,
      you: 'up',
    },
  },
  {
    id: 2,
    title: 'Who’s really pushing ‘bad science’?',
    type: 'Q',
    user: {
      name: 'Joe Sample',
      title: 'Physicist',
    },
    votes: {
      up: 32,
      down: 11,
      you: 'up',
    },
  },
  {
    id: 3,
    title: 'Who’s really pushing ‘bad science’?',
    type: 'Ob',
    user: {
      name: 'Joe Sample',
      title: 'Physicist',
    },
    votes: {
      up: 11,
      down: 11,
    },
  },
  {
    id: 4,
    title: 'Who’s really pushing ‘bad science’?',
    type: 'H',
    user: {
      name: 'Joe Sample',
      title: 'Physicist',
    },
    votes: {
      up: 23,
      down: 41,
      you: 'up',
    },
  },
];

export const RelatedItems = [
  {
    title: 'Fighting the continuing tide of secularism.',
    type: 'Ob',
    description:
      'First, the task of producing all the information we do by web, magazine and more is huge and ongoing....',
    user: {
      name: 'Joe Sample',
      title: 'Physicist',
    },
    votes: {
      up: 132,
      down: 21,
      you: 'up',
    },
    date: 'August 13, 2018',
    reviews: 12,
  },
  {
    title: 'The elephant in the room',
    type: 'Q',
    description:
      'The Kiwi Party believes that parents are responsible for their children’s education...',
    user: {
      name: 'Joe Sample',
      title: 'Physicist',
    },
    votes: {
      up: 32,
      down: 11,
      you: 'down',
    },
    date: 'August 13, 2018',
    reviews: 12,
  },
  {
    title: 'Fighting the continuing tide of secularism.',
    type: 'H',
    description:
      'First, the task of producing all the information we do by web, magazine and more is huge and ongoing....',
    user: {
      name: 'Joe Sample',
      title: 'Physicist',
    },
    votes: {
      up: 32,
      down: 51,
    },
    date: 'August 13, 2018',
    reviews: 12,
  },
];
