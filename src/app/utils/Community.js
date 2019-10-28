export class Role {
    static LEVELS = ['muted', 'guest', 'member', 'mod', 'admin', 'owner'];

    static level = role => {
        if (!role) throw 'empty role provided';
        const level = Role.LEVELS.indexOf(role);
        if (level == -1) throw 'invalid role: ' + role;
        return level;
    };

    static atLeast = (role, target) => {
        return Role.level(role) >= Role.level(target);
    };

    static canPost = (name, role) => {
        if (!name) return true;
        // journal/council restriction: only members can post
        const minRole = Role.parseType(name) == 1 ? 'guest' : 'member';
        return Role.atLeast(role, minRole);
    };

    static canComment = (name, role) => {
        if (!name) return true;
        // council restriction: only members can comment
        const minRole = Role.parseType(name) == 3 ? 'member' : 'guest';
        return Role.atLeast(role, minRole);
    };

    static parseType = name => {
        return parseInt(name[5]);
    };
}

export function ifHive(category) {
    return category && category.substring(0, 5) == 'hive-' ? category : null;
}
