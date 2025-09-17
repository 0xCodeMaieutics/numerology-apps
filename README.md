# shadcn/ui monorepo template

This template is for creating a monorepo with shadcn/ui.

## Usage

```bash
pnpm dlx shadcn@latest init
```

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Tailwind

Your `tailwind.config.ts` and `globals.css` are already set up to use the components from the `ui` package.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button";
```

# Useful Development commands

### Docker

```sh
docker compose up --build --remove-orphans -d
```

```sh
docker exec -it <container> (bash|sh)
```

### mongosh commands

login with user and pass

```sh
mongosh -u user -p pass –authenticationDatabase admin
```

Replica set status query

```js
rs.status();
```

Switch to admin database

```sh
use admin
```

Create user

```js
admin.createUser({
  user: "user",
  pwd: "pass",
  roles: [{ role: "userAdminAnyDatabase", db: "admin" }],
});
```

### Mongo Errors

Error: "BadValue: security.keyFile is required when authorization is enabled with replica sets"

### File stuff

chmod = change mode
chown = change owner (c©hown 999:999)

docker-entrypoint-initdb.d directory in docker that executes its scripts during docker container's startup

Generate keyfile for replicate security:

```sh
openssl rand -base64 756 > path/to/replica.key
```

Change file mode

```sh
chmod chmod 400 path/to/replica.key
```
