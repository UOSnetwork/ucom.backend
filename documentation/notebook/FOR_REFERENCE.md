# For reference

## Blockchain commands

A command to monitor blockchain availability
```
curl --request POST   --url https://api-node-1.ucommunity.io:7888/v1/chain/get_table_rows -d '{"scope":"uos.calcs","code":"uos.calcs","table":"reports","json":"true","limit":"100","lower_bound":"31500"}'
```

## Blockchain MongoDB plugin indexes

### transaction_traces

```
account_and_name_and_from_and_to_ids
{
  "action_traces.act.account" : 1,
  "action_traces.act.name" : 1,
  "action_traces.act.data.from" : 1,
  "action_traces.act.data.to" : 1
}

account_and_name_idx
{
  "action_traces.act.account" : 1,
  "action_traces.act.name" : 1
}
```