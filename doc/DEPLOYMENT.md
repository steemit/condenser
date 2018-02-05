# How To Deploy In Production

## Front End

* recommend fronting with a reverse proxy such as nginx

## Rate Limiting

* You will want to rate limit certain paths, likely to ~1r/s in your proxy

```
/c/api/initiate_account_recovery
/c/api/account_recovery_confirmation/:code
/c/api/request_account_recovery
/c/api/accounts
/c/api/update_email
/c/api/login_account
```
