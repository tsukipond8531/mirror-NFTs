# Miral

A relayer able to mirror any NFT to an arbitrary L2

## How to use it

- Launch MongoDB using docker compose

```
docker compose up
```

- Launch relayer

```
yarn start
```

And that's pretty much it

## How to interact

- Login

```
http://localhost:3000/login/--L1 EOA--/--L1 NFT ADDRESS--/--Token Id--
```

## Architecture
<p align="center">
  <img src="assets/miral-arch.jpg" title="hover text">
</p>
