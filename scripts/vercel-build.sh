#!/bin/sh
# Vercel build command (see vercel.json). Applies pending Prisma migrations, then builds.
#
# Migrations run on production deploys only, so a preview of a branch with an unmerged migration
# can't change the live database. Set RUN_MIGRATIONS=1 on a preview environment that has its own
# database to migrate it too. `prisma migrate deploy` only applies committed migrations, never
# resets data, and is a no-op when nothing is pending; if one fails, the deploy fails and the
# previous deployment keeps serving.
set -e

if [ "$VERCEL_ENV" = "production" ] || [ "$RUN_MIGRATIONS" = "1" ]; then
	echo "Applying database migrations…"
	pnpm db:deploy
else
	echo "Skipping migrations (VERCEL_ENV=${VERCEL_ENV:-unset})."
fi

pnpm build
