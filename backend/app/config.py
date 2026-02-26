from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite+aiosqlite:///./pokemon_tcg.db"

    # TCGPlayer API
    tcgplayer_public_key: str = ""
    tcgplayer_private_key: str = ""
    tcgplayer_api_base: str = "https://api.tcgplayer.com/v1.39.0"

    # eBay API
    ebay_app_id: str = ""
    ebay_cert_id: str = ""
    ebay_api_base: str = "https://api.ebay.com"

    # Pokemon TCG API
    pokemon_tcg_api_key: str = ""
    pokemon_tcg_api_base: str = "https://api.pokemontcg.io/v2"

    # App settings
    cors_origins: list[str] = ["http://localhost:5173"]
    price_update_interval_minutes: int = 60
    cache_ttl_seconds: int = 300

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
