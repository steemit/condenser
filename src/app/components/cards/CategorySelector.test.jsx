import { expect } from 'chai';
import { validateCategory } from "./CategorySelector";

describe ( 'validateCategory', () => {
    it('should correctly categorise the failed tag validation', () => {
        const test_cases = [
            ['one two three four five six', 'missing translation: en.category_selector_jsx.use_limited_amount_of_categories'],
            ['technicallythisattemptatacategoryhasmorethan24characters', 'missing translation: en.category_selector_jsx.maximum_tag_length_is_24_characters'],
            ['using-more-than-one-dash', 'missing translation: en.category_selector_jsx.use_one_dash'],
            ['using,commas,tags', 'missing translation: en.category_selector_jsx.use_spaces_to_separate_tags'],
            ['UppEr caSE TagS', 'missing translation: en.category_selector_jsx.use_only_lowercase_letters'],
            [' ᐖ Ⅷ', 'missing translation: en.category_selector_jsx.use_only_allowed_characters'],
            ['12starts with number', 'missing translation: en.category_selector_jsx.must_start_with_a_letter'],
            ['does notend with valid#', 'missing translation: en.category_selector_jsx.must_end_with_a_letter_or_number'],
        ];
        test_cases.forEach(cat => {
            expect(validateCategory(cat[0])).to.equal(cat[1]);
        });
    });
});