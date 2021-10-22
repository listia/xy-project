# X,Y Project

This is a community-operated [dApp and website for the X,Y Project](https://xyproject.io) (a community-focused NFT metaverse project featuring on-chain coordinates representing a 128x128 grid). Contribute to improve the dApp and site or fork to easily jumpstart your own projects, games, and dApps on top of X,Y. Use X,Y Project in any way you want. For example: maps, tiles, locations, games, virtual worlds, and more.

Fork this project to create your own version of The Grid, with your own set of rules, funtionality, etc. Or modify it it even more to build your own custom dapp on top of X,Y Project.

## Run locally

```bash
# Install dependencies
yarn

# Run
yarn dev
```

Open http://localhost:3000 with your browser to see the result.

## Database caching

Unless you configure a [Faunda DB](https://fauna.com) key in your local environment, the dapp will run without a cached copy of the on-chain data. You can sync the on-chain data within the UI, but it will be very slow to load. To alleviate this, you can sign up for the free tier of their service, which should be plenty for local development. This is even more important if you are cloning the project to create your own dapp or site. You will want to add the key to your environment variables as FAUNA_ADMIN_KEY. It should create the correct databases for you when you load up the app and then you can modify things as you see fit.

## Opensea API

This project makes use of the [Opensea API](https://docs.opensea.io/reference/getting-assets) to pull data about NFT ownership from other projects. You can make most calls without an API key, but they will eventually throttle or limit you if you make too many calls. If you have your own API key, you can add it to your environment variables as OPENSEA_API_KEY to alleviate the throttling.

## Thank you

This project is based off of the [next-web3-boilerplate](https://github.com/mirshko/next-web3-boilerplate) by [@mirshko](https://github.com/mirshko)
