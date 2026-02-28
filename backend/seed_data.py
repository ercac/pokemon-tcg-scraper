"""Seed the database with sample Pokemon card data for demo/testing."""
import asyncio
import json
from datetime import datetime, timedelta
import random

from app.database import async_session_factory, engine, Base
from app.models.card import Card
from app.models.price import Price, PriceHistory


SAMPLE_CARDS = [
    {
        "pokemon_tcg_id": "base1-4",
        "name": "Charizard",
        "set_name": "Base Set",
        "set_code": "base1",
        "number": "4/102",
        "rarity": "Rare Holo",
        "supertype": "Pokemon",
        "image_small": "https://images.pokemontcg.io/base1/4.png",
        "image_large": "https://images.pokemontcg.io/base1/4_hires.png",
        "artist": "Mitsuhiro Arita",
        "hp": "120",
        "types_json": json.dumps(["Fire"]),
    },
    {
        "pokemon_tcg_id": "base1-58",
        "name": "Pikachu",
        "set_name": "Base Set",
        "set_code": "base1",
        "number": "58/102",
        "rarity": "Common",
        "supertype": "Pokemon",
        "image_small": "https://images.pokemontcg.io/base1/58.png",
        "image_large": "https://images.pokemontcg.io/base1/58_hires.png",
        "artist": "Mitsuhiro Arita",
        "hp": "40",
        "types_json": json.dumps(["Lightning"]),
    },
    {
        "pokemon_tcg_id": "base1-2",
        "name": "Blastoise",
        "set_name": "Base Set",
        "set_code": "base1",
        "number": "2/102",
        "rarity": "Rare Holo",
        "supertype": "Pokemon",
        "image_small": "https://images.pokemontcg.io/base1/2.png",
        "image_large": "https://images.pokemontcg.io/base1/2_hires.png",
        "artist": "Ken Sugimori",
        "hp": "100",
        "types_json": json.dumps(["Water"]),
    },
    {
        "pokemon_tcg_id": "base1-15",
        "name": "Venusaur",
        "set_name": "Base Set",
        "set_code": "base1",
        "number": "15/102",
        "rarity": "Rare Holo",
        "supertype": "Pokemon",
        "image_small": "https://images.pokemontcg.io/base1/15.png",
        "image_large": "https://images.pokemontcg.io/base1/15_hires.png",
        "artist": "Mitsuhiro Arita",
        "hp": "100",
        "types_json": json.dumps(["Grass", "Poison"]),
    },
    {
        "pokemon_tcg_id": "base1-10",
        "name": "Mewtwo",
        "set_name": "Base Set",
        "set_code": "base1",
        "number": "10/102",
        "rarity": "Rare Holo",
        "supertype": "Pokemon",
        "image_small": "https://images.pokemontcg.io/base1/10.png",
        "image_large": "https://images.pokemontcg.io/base1/10_hires.png",
        "artist": "Ken Sugimori",
        "hp": "60",
        "types_json": json.dumps(["Psychic"]),
    },
    {
        "pokemon_tcg_id": "swsh12pt5-160",
        "name": "Pikachu VMAX",
        "set_name": "Crown Zenith",
        "set_code": "swsh12pt5",
        "number": "160/195",
        "rarity": "Rare Holo VMAX",
        "supertype": "Pokemon",
        "image_small": "https://images.pokemontcg.io/swsh12pt5/160.png",
        "image_large": "https://images.pokemontcg.io/swsh12pt5/160_hires.png",
        "artist": "aky CG Works",
        "hp": "310",
        "types_json": json.dumps(["Lightning"]),
    },
    {
        "pokemon_tcg_id": "sv3pt5-7",
        "name": "Charizard ex",
        "set_name": "151",
        "set_code": "sv3pt5",
        "number": "6/165",
        "rarity": "Double Rare",
        "supertype": "Pokemon",
        "image_small": "https://images.pokemontcg.io/sv3pt5/6.png",
        "image_large": "https://images.pokemontcg.io/sv3pt5/6_hires.png",
        "artist": "PLANETA Mochizuki",
        "hp": "330",
        "types_json": json.dumps(["Fire"]),
    },
    {
        "pokemon_tcg_id": "neo1-9",
        "name": "Lugia",
        "set_name": "Neo Genesis",
        "set_code": "neo1",
        "number": "9/111",
        "rarity": "Rare Holo",
        "supertype": "Pokemon",
        "image_small": "https://images.pokemontcg.io/neo1/9.png",
        "image_large": "https://images.pokemontcg.io/neo1/9_hires.png",
        "artist": "Hironobu Yoshida",
        "hp": "90",
        "types_json": json.dumps(["Psychic"]),
    },
    {
        "pokemon_tcg_id": "base1-3",
        "name": "Chansey",
        "set_name": "Base Set",
        "set_code": "base1",
        "number": "3/102",
        "rarity": "Rare Holo",
        "supertype": "Pokemon",
        "image_small": "https://images.pokemontcg.io/base1/3.png",
        "image_large": "https://images.pokemontcg.io/base1/3_hires.png",
        "artist": "Ken Sugimori",
        "hp": "120",
        "types_json": json.dumps(["Colorless"]),
    },
    {
        "pokemon_tcg_id": "base1-1",
        "name": "Alakazam",
        "set_name": "Base Set",
        "set_code": "base1",
        "number": "1/102",
        "rarity": "Rare Holo",
        "supertype": "Pokemon",
        "image_small": "https://images.pokemontcg.io/base1/1.png",
        "image_large": "https://images.pokemontcg.io/base1/1_hires.png",
        "artist": "Ken Sugimori",
        "hp": "80",
        "types_json": json.dumps(["Psychic"]),
    },
]


def generate_prices(card_id: int, base_price: float):
    """Generate sample TCGPlayer + eBay prices for a card."""
    prices = []
    # TCGPlayer
    tcg_market = round(base_price * random.uniform(0.95, 1.05), 2)
    prices.append(Price(
        card_id=card_id,
        marketplace="tcgplayer",
        condition="near_mint",
        variant="Normal",
        low_price=round(base_price * 0.8, 2),
        mid_price=round(base_price * 1.0, 2),
        high_price=round(base_price * 1.3, 2),
        market_price=tcg_market,
        listing_url=f"https://www.tcgplayer.com/search/pokemon/product?q=card",
    ))
    # eBay
    ebay_market = round(base_price * random.uniform(1.0, 1.15), 2)
    prices.append(Price(
        card_id=card_id,
        marketplace="ebay",
        condition="near_mint",
        variant="Normal",
        low_price=round(base_price * 0.85, 2),
        mid_price=round(base_price * 1.05, 2),
        high_price=round(base_price * 1.5, 2),
        market_price=ebay_market,
        listing_url=f"https://www.ebay.com/sch/i.html?_nkw=pokemon+card",
    ))
    return prices, tcg_market, ebay_market


def generate_price_history(card_id: int, base_price: float, days: int = 60):
    """Generate sample price history for charting."""
    history = []
    now = datetime.utcnow()
    tcg_price = base_price
    ebay_price = base_price * 1.05

    for day_offset in range(days, 0, -1):
        date = now - timedelta(days=day_offset)
        # Simulate price fluctuation
        tcg_price *= random.uniform(0.97, 1.03)
        ebay_price *= random.uniform(0.97, 1.03)

        history.append(PriceHistory(
            card_id=card_id,
            marketplace="tcgplayer",
            condition="near_mint",
            variant="Normal",
            market_price=round(tcg_price, 2),
            recorded_at=date,
        ))
        history.append(PriceHistory(
            card_id=card_id,
            marketplace="ebay",
            condition="near_mint",
            variant="Normal",
            market_price=round(ebay_price, 2),
            recorded_at=date,
        ))
    return history


BASE_PRICES = {
    "Charizard": 250.00,
    "Pikachu": 15.00,
    "Blastoise": 85.00,
    "Venusaur": 65.00,
    "Mewtwo": 45.00,
    "Pikachu VMAX": 28.00,
    "Charizard ex": 35.00,
    "Lugia": 180.00,
    "Chansey": 30.00,
    "Alakazam": 40.00,
}


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as db:
        # Insert cards
        cards = []
        for card_data in SAMPLE_CARDS:
            card = Card(**card_data)
            db.add(card)
            cards.append(card)
        await db.flush()

        # Insert prices and history for each card
        for card in cards:
            base_price = BASE_PRICES.get(card.name, 20.0)
            prices, _, _ = generate_prices(card.id, base_price)
            for p in prices:
                db.add(p)
            history = generate_price_history(card.id, base_price)
            for h in history:
                db.add(h)

        await db.commit()
        print(f"Seeded {len(cards)} cards with prices and 60-day price history!")


if __name__ == "__main__":
    asyncio.run(seed())
