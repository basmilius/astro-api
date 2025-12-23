# Postcode API

This API is a simple wrapper around public BAG data from the government of The Netherlands.

## Requirements

- Bun 1.2.9
- A database file called `bag.gpkg` from the Dutch Government.

## Build

```shell
docker build --pull -t ghcr.io/basmilius/postcode-api:latest --platform linux/amd64 .
docker push ghcr.io/basmilius/postcode-api:latest
```
