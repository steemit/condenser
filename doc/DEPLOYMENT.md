# How To Deploy In Production

## Front End

* recommend fronting with a reverse proxy such as nginx

## Rate Limiting

* You will want to rate limit certain paths, likely to ~1r/s in your proxy

```
/api/v1/initiate_account_recovery
/api/v1/account_recovery_confirmation/:code
/api/v1/request_account_recovery
/api/v1/accounts
/api/v1/update_email
/api/v1/login_account
```
