# Load .env file environment variables
include .env
export

infra-run:
	docker compose up --build --force-recreate --remove-orphans

infra-clean:
	docker compose rm --volumes --force

connect-postgres:
	docker run --rm -it --network=host bitnami/postgresql psql -h $(DB_POSTGRES_HOST) -U $(DB_POSTGRES_USERNAME) -d $(DB_POSTGRES_DATABASE)

connect-redis:
	docker run --rm -it --network=host bitnami/redis redis-cli -h $(DB_REDIS_HOST) -a $(DB_REDIS_PASSWORD)
	