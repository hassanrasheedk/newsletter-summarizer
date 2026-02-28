.PHONY: start stop logs dev build

start:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo ""; \
		echo "  Created .env from .env.example"; \
		echo "  Fill in your credentials then run: make start"; \
		echo ""; \
		exit 1; \
	fi
	docker compose up --build -d
	@echo ""
	@echo "  Running at http://localhost:3000"
	@echo ""

stop:
	docker compose down

logs:
	docker compose logs -f

dev:
	npm run dev

build:
	npm run build
