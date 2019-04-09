interface OneUserAirdropDto  {
  airdrop_id: number,
  user_id: number | null, // null only if airdrop_status = new
  score: number,
  airdrop_status: number,
  conditions: OneUserAirdropConditions,
  tokens: OneUserAirdropToken[],
}

interface OneUserAirdropConditions {
  auth_github: boolean;
  auth_myself: boolean;
  following_devExchange: boolean;
}

interface OneUserAirdropFilter {
  airdrop_id: number;
}

interface OneUserAirdropToken {
  amount_claim: number;
  symbol: string;
}

interface FreshUserDto {
  readonly user_id: number;
  readonly json_data: any;
  readonly users_external_id: number;
}

interface AirdropDebtDto {
  readonly debt_account_id: number;
  readonly symbol_id: number;
  readonly symbol: string;
  readonly current_balance: number;
}

interface TokensToClaim {
  symbol_id: number,
  amount: number,
}

interface AirdropsUserToChangeStatusDto {
  readonly account_name_to: string;
  readonly user_id: number;

  readonly airdrop_id: number;

  readonly id: number;

  readonly account_id_from: number;
  readonly amount: number;
  readonly account_id_to: number;

  readonly symbol_id: number;
  readonly symbol_title: string;
}

export {
  OneUserAirdropDto,
  OneUserAirdropFilter,
  FreshUserDto,
  AirdropDebtDto,
  TokensToClaim,
  AirdropsUserToChangeStatusDto,
};
