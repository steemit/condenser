import linksRe from 'app/utils/Links';

function truncate(str, len) {
    if (str) {
        str = str.trim();
        if (str.length > len) {
            str = str.substring(0, len - 1) + '...';
        }
    }
    return str;
}

/**
 * Enforce profile data length & format standards.
 */
export default function normalizeProfile(account) {
    if (!account) return {};

    // Parse
    let profile = {};
    if (account.json_metadata) {
        try {
            const md = JSON.parse(account.json_metadata);
            if (md.profile) {
                profile = md.profile;
            }
            if (!(typeof profile == 'object')) {
                console.error(
                    'Expecting object in account.json_metadata.profile:',
                    profile
                );
                profile = {};
            }
        } catch (e) {
            console.error(
                'Invalid json metadata string',
                account.json_metadata,
                'in account',
                account.name
            );
        }
    }

    // Read & normalize
    let {
        name,
        about,
        location,
        website,
        profile_image,
        cover_image,
    } = profile;

    name = truncate(name, 20);
    about = truncate(about, 160);
    location = truncate(location, 30);

    if (/^@/.test(name)) name = null;
    if (website && website.length > 100) website = null;
    if (website && website.indexOf('http') === -1) {
        website = 'http://' + website;
    }
    if (website) {
        // enforce that the url regex matches, and fully
        const m = website.match(linksRe.any);
        if (!m || m[0] !== website) {
            website = null;
        }
    }

    if (profile_image && !/^https?:\/\//.test(profile_image))
        profile_image = null;
    if (cover_image && !/^https?:\/\//.test(cover_image)) cover_image = null;

    return {
        name,
        about,
        location,
        website,
        profile_image,
        cover_image,
    };
}
