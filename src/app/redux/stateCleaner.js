import GDPRUserList from '../utils/GDPRUserList';

const accountsToRemove = GDPRUserList;

const gdprFilterAccounts = stateAccounts =>
    Object.keys(stateAccounts)
        .filter(name => !accountsToRemove.includes(name))
        .reduce(
            (acc, cur) => ({
                ...acc,
                [cur]: stateAccounts[cur],
            }),
            {}
        );

const gdprFilterContent = stateContent => {
    const contentToRemove = Object.keys(stateContent).filter(key =>
        accountsToRemove.includes(stateContent[key].author)
    );

    const contentToKeep = Object.keys(stateContent).filter(
        key => !accountsToRemove.includes(stateContent[key].author)
    );

    // First, remove content authored by GDPR users.
    const removedByAuthor = contentToKeep.reduce(
        (acc, cur) => ({
            ...acc,
            [cur]: stateContent[cur],
        }),
        {}
    );

    // Finally, remove GDPR-authored replies referenced in other content.
    return Object.keys(removedByAuthor).reduce(
        (acc, cur) => ({
            ...acc,
            [cur]: {
                ...removedByAuthor[cur],
                replies: removedByAuthor[cur].replies.filter(
                    url => !contentToRemove.includes(url)
                ),
            },
        }),
        {}
    );
};

export default function stateCleaner(state) {
    return {
        ...state,
        accounts: gdprFilterAccounts(state.accounts),
        content: gdprFilterContent(state.content),
    };
}
