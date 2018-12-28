"use strict";
const _ = require('lodash');
const TAG_REGEX = /#[a-zA-Z]\w*/gm;
const TAG_MAX_LENGTH = 2048;
const USER_MENTIONS_REGEX = /@[a-z1-5]{12}/gm;
class TagsParserService {
    static parseTags(inputString) {
        const tagsArray = inputString.match(TAG_REGEX);
        if (tagsArray === null) {
            return [];
        }
        const uniqueValues = _.uniq(tagsArray.map(item => item.replace('#', '')));
        return uniqueValues.filter(item => item.length < TAG_MAX_LENGTH);
    }
    static parseMentions(inputString) {
        const tagsArray = inputString.match(USER_MENTIONS_REGEX);
        if (tagsArray === null) {
            return [];
        }
        return _.uniq(tagsArray.map(item => item.replace('@', '')));
    }
}
module.exports = TagsParserService;