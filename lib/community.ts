/**
 * Community role helpers — paired port of legacy src/app/utils/Community.js.
 *
 * Semantics are intentionally unchanged (including the journal/council
 * type_id quirks in canPost/canComment); the rest of the app must make the
 * same gating decisions legacy made, so any divergence here changes what
 * users are allowed to do.
 */

import type { Community, CommunityContext } from '@/types/steem';

const ROLE_LEVELS = ['muted', 'guest', 'member', 'mod', 'admin', 'owner'] as const;

export class Role {
    static LEVELS = ROLE_LEVELS;

    static level(role: string): number {
        if (!role) throw new Error('empty role provided');
        const level = ROLE_LEVELS.indexOf(role as (typeof ROLE_LEVELS)[number]);
        if (level === -1) throw new Error('invalid role: ' + role);
        return level;
    }

    static atLeast(role: string, target: string): boolean {
        return Role.level(role) >= Role.level(target);
    }

    static canPost(name: string, role: string): boolean {
        if (!name) return true;
        // journal/council restriction: only members can post
        const minRole = Role.parseType(name) === 1 ? 'guest' : 'member';
        return Role.atLeast(role, minRole);
    }

    static canComment(name: string, role: string): boolean {
        if (!name) return true;
        // council restriction: only members can comment
        const minRole = Role.parseType(name) === 3 ? 'member' : 'guest';
        return Role.atLeast(role, minRole);
    }

    static parseType(name: string): number {
        return parseInt(name[5]);
    }
}

/** Legacy ifHive(): the tag is a community id, else null. */
export function ifHive(category: string | null | undefined): string | null {
    return category && category.substring(0, 5) === 'hive-' ? category : null;
}

/**
 * Read community.context as an object regardless of the wire shape.
 * hivemind returns `context: []` for anonymous callers; legacy read it via
 * Immutable getIn(['context', 'role'], 'guest') which tolerated that.
 */
function contextObject(community: Community | null | undefined): CommunityContext | null {
    const ctx = community?.context;
    if (!ctx || Array.isArray(ctx)) return null;
    return ctx;
}

/** Viewer's role in the community, defaulting to 'guest' (legacy default). */
export function viewerRole(community: Community | null | undefined): string {
    return contextObject(community)?.role || 'guest';
}

/** Whether the viewer is subscribed to the community (legacy context.subscribed). */
export function viewerSubscribed(community: Community | null | undefined): boolean {
    return Boolean(contextObject(community)?.subscribed);
}
