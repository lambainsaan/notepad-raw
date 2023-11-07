---
created: 2023-09-29T23:34:44+05:30
updated: 2023-11-07T10:57:34+05:30
title: Integrate 1Password into Github Actions 🔐
---
I push notes from [[Building In Public/rhitiks-notepad#Notepad Raw|Notepad Raw]] to [[Building In Public/rhitiks-notepad#Notepad|Notepad]], for pushing the data from my action in Notepad Raw to Notepad, I need to generate a token. This token needs to be regenerated every once in a while because of expiry. And when the day comes and the token expires, the CI pipeline starts failing.

This has happened a couple of times over the past few months when my token went stale and my CI pipelines started going haywire as a result.

I can update my token by going to the github settings every once in a while, but I thought it would be better if I would integrate 1Password directly into the CI pipeline. If I integrate 1Password into the tooling, then it would be easier to manage the secrets, because I use 1Password for all my credentials, and it can remind me when the creds are expiring, plus I don't have to navigate into github to change the secrets.

And so that's what Rhitik did yesterday, he integrated 1Password in the github action.

Steps are pretty straightforward,

1. Create a new vault on 1Password, put your secret there. [Create vaults](https://support.1password.com/create-share-vaults/#:~:text=all%20your%20devices.-,To%20create%20a%20vault%2C%20tap%20Items%2C%20then%20tap%20New%20Vault,Give%20your%20vault%20a%20name.)
2. Create a service account on 1password and give it access to the vault you just created in last step. [1Password Service Accounts](https://developer.1password.com/docs/service-accounts/)
3. Then comes creation of a new secret in your repo, `OP_SERVICE_ACCOUNT_TOKEN` which contains the token generated in the last step. [Using secrets in GitHub Actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
4. Integrate 1Password action into github action to fetch token from your 1Password vault.

```yaml
# github-action.yaml
# other steps ...
      - name: Configure 1Password Service Account
        uses: 1password/load-secrets-action/configure@v1
        with:
          service-account-token: ${{ secrets.OP_SERVICE_ACCOUNT_TOKEN }}

      - name: Load secret
        id: load-secret
        uses: 1password/load-secrets-action@v1
        with:
          export-env: false
        env:
          GITHUB_NOTEPAD_RAW_TOKEN: op://app-cicd/hello-world/secret

      - name: Print masked secret
        run: echo "Secret: ${{ steps.load-secret.outputs.GITHUB_NOTEPAD_RAW_TOKEN }}"

# other steps ...
```


Much verbose documentation for the same from 1Password, [Load secrets from 1Password into GitHub Actions](https://developer.1password.com/docs/ci-cd/github-actions/)