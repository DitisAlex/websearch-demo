.PHONY: install backend frontend dev

install:
	python3 -m venv .venv
	.venv/bin/pip install -r requirements.txt
	cd frontend && npm install

backend:
	.venv/bin/uvicorn backend.main:app --reload

frontend:
	cd frontend && npm run dev

dev:
	@echo "Starting backend and frontend..."
	$(MAKE) backend & $(MAKE) frontend
