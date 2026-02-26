from fastapi import APIRouter

from app.integrations.pokemon_tcg_api import pokemon_tcg_client

router = APIRouter(prefix="/api/sets", tags=["sets"])


@router.get("")
async def list_sets():
    """Get all Pokemon TCG sets for browsing."""
    return await pokemon_tcg_client.get_sets()
