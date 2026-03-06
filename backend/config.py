import os
from dotenv import load_dotenv

load_dotenv()

ROUTER_BASE_URL = os.environ["ROUTER_BASE_URL"]
ROUTER_BEARER_TOKEN = os.environ["ROUTER_BEARER_TOKEN"]
ROUTER_CLIENT_HEADER = os.environ["ROUTER_CLIENT_HEADER"]
