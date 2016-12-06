function truncate(str, len) {
    if(str && str.length > len) {
        return str.substring(0, len - 1) + '...'
    }
    return str
}

/**
 * Enforce profile data length & format standards.
 */
export default function normalizeProfile(account) {

    if(! account) return {}

    // Parse
    let profile = {};
    if(account.json_metadata) {
        try {
            const md = JSON.parse(account.json_metadata);
            if(md.profile) {
                profile = md.profile;
            }
        } catch (e) {
            console.error('Invalid json metadata string', account.json_metadata, 'in account', account.name);
        }
    }

    // Read & normalize
    let {name, about, location, website, profile_image} = profile

    name = truncate(name, 20)
    about = truncate(about, 160)
    location = truncate(location, 30)

    if(website && website.length > 100) website = null;
    if (website && website.indexOf("http") === -1) {
        website = 'http://' + website;
    }
    if(profile_image && !/^https?:\/\//.test(profile_image)) profile_image = null;

    return {
        name,
        about,
        location,
        website,
        profile_image,
    };
}
