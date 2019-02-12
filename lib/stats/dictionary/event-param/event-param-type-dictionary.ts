const CURRENT_BLOCKCHAIN_IMPORTANCE = 1;
const POST_VOTES_CURRENT_AMOUNT     = 3;
const POST_REPOSTS_CURRENT_AMOUNT   = 4;
const POST_COMMENTS_CURRENT_AMOUNT  = 5;
const ORG_POSTS_CURRENT_AMOUNT      = 6;
const ORG_FOLLOWERS_CURRENT_AMOUNT  = 7;
const TAG_ITSELF_CURRENT_AMOUNTS    = 8;
const POST_CURRENT_ACTIVITY_INDEX   = 9;

/** Exact event description */
class EventParamTypeDictionary {
  public static getTagItselfCurrentAmounts(): number {
    return TAG_ITSELF_CURRENT_AMOUNTS;
  }

  public static getOrgFollowersCurrentAmount(): number {
    return ORG_FOLLOWERS_CURRENT_AMOUNT;
  }

  public static getOrgPostsCurrentAmount(): number {
    return ORG_POSTS_CURRENT_AMOUNT;
  }

  public static getPostVotesCurrentAmount(): number {
    return POST_VOTES_CURRENT_AMOUNT;
  }

  public static getPostRepostsCurrentAmount(): number {
    return POST_REPOSTS_CURRENT_AMOUNT;
  }

  public static getPostCommentsCurrentAmount(): number {
    return POST_COMMENTS_CURRENT_AMOUNT;
  }

  public static getPostCurrentActivityIndex(): number {
    return POST_CURRENT_ACTIVITY_INDEX;
  }

  public static getCurrentBlockchainImportance(): number {
    return CURRENT_BLOCKCHAIN_IMPORTANCE;
  }
}

export = EventParamTypeDictionary;