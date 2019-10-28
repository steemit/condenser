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
}

export function ifHive(category) {
    return category && category.substring(0, 5) == 'hive-' ? category : null;
}
