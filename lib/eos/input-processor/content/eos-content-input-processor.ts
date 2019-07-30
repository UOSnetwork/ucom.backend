import { IRequestBody } from '../../../common/interfaces/common-types';
import { BadRequestError } from '../../../api/errors';

class EosContentInputProcessor {
  public static getSignedTransactionFromBody(
    body: IRequestBody,
  ): { signed_transaction: string, blockchain_id: string } | null {
    const { signed_transaction, blockchain_id } = body;

    if (!signed_transaction && !blockchain_id) {
      return null;
    }

    if (signed_transaction && !blockchain_id) {
      throw new BadRequestError('If you provide a signed_transaction you must provide a content_id also.');
    }

    if (blockchain_id && !signed_transaction) {
      throw new BadRequestError('If you provide a content_id you must provide a signed_transaction also.');
    }

    return {
      signed_transaction,
      blockchain_id,
    };
  }
}

export  = EosContentInputProcessor;