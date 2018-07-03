export const DRAFT_KEY = 'golos.post.draft';
export const EDIT_KEY = 'golos.post.editDraft';

export function getEditDraftPermLink() {
    try {
        const json = sessionStorage.getItem(EDIT_KEY);

        if (json) {
            const data = JSON.parse(json);

            if (data.permLink) {
                return data.permLink;
            }
        }
    } catch (err) {}
}
