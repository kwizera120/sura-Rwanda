import re
from functools import lru_cache
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "routes.xlsx"

COLUMN_ALIASES = {
    "from_city": ["from_city", "source", "origin", "departure", "start", "from"],
    "to_city": ["to_city", "destination", "arrival", "end", "to"],
    "distance_km": ["distance_km", "distance", "km", "distance(km)"],
    "transport_type": ["transport_type", "transport", "mode", "vehicle"],
    "demand": ["demand", "demand_level", "traffic", "season"],
    "price": ["price", "price_rwf", "fare", "cost", "amount"],
    "duration": ["duration", "time", "travel_time"],
}


def _clean_column_name(name: str) -> str:
    return str(name).strip().lower().replace(" ", "_")


def _find_column(columns: list[str], aliases: list[str]) -> str | None:
    normalized_aliases = {_clean_column_name(alias) for alias in aliases}
    for column in columns:
        if _clean_column_name(column) in normalized_aliases:
            return column
    return None


@lru_cache(maxsize=1)
def load_routes_dataframe():
    import pandas as pd
    if not DATA_PATH.exists() or DATA_PATH.stat().st_size == 0:
        return pd.DataFrame()

    try:
        dataframe = pd.read_excel(DATA_PATH, sheet_name="Routes", engine="openpyxl")
    except Exception:
        return pd.DataFrame()

    return dataframe.fillna("")


@lru_cache(maxsize=1)
def load_districts() -> list[str]:
    import pandas as pd
    if not DATA_PATH.exists() or DATA_PATH.stat().st_size == 0:
        return []

    try:
        dataframe = pd.read_excel(DATA_PATH, sheet_name="Districts", engine="openpyxl")
    except Exception:
        return []

    if "District" not in dataframe.columns:
        return []

    return sorted(
        {
            str(value).strip().title()
            for value in dataframe["District"].dropna().tolist()
            if str(value).strip()
        }
    )


def _extract_route(message: str):
    match = re.search(r"\bfrom\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+)\b", message, re.IGNORECASE)
    if not match:
        return None

    return match.group(1).strip().title(), match.group(2).strip().title()


def _extract_distance(message: str) -> float | None:
    match = re.search(r"(\d+(?:\.\d+)?)\s*km\b", message, re.IGNORECASE)
    if not match:
        return None
    return float(match.group(1))


def _extract_transport(message: str) -> str:
    lowered = message.lower()
    for option in ["bus", "moto", "motorbike", "taxi", "car", "boat"]:
        if option in lowered:
            return option
    return "bus"


def _extract_demand(message: str) -> str:
    lowered = message.lower()
    for option in ["peak", "high", "medium", "normal", "low"]:
        if option in lowered:
            return option
    return "medium"


def _mentioned_districts(message: str) -> list[str]:
    lowered_message = message.lower()
    matches = []

    for district in load_districts():
        if district.lower() in lowered_message:
            matches.append(district)

    return matches


def _build_destination_context(message: str) -> str | None:
    matched = _mentioned_districts(message)
    if not matched:
        return None

    if len(matched) == 1:
        return (
            f"Recognized destination from local project data: {matched[0]}. "
            "This district is part of the supported Rwanda destinations in the workbook."
        )

    return "Recognized destinations from local project data: " + ", ".join(matched) + "."


def _build_dataset_context(message: str) -> str | None:
    route = _extract_route(message)
    dataframe = load_routes_dataframe()
    if dataframe.empty or not route:
        return None

    from_city, to_city = route
    columns = list(dataframe.columns)
    from_column = _find_column(columns, COLUMN_ALIASES["from_city"])
    to_column = _find_column(columns, COLUMN_ALIASES["to_city"])

    if not from_column or not to_column:
        return None

    filtered = dataframe[
        dataframe[from_column].astype(str).str.strip().str.lower().eq(from_city.lower())
        & dataframe[to_column].astype(str).str.strip().str.lower().eq(to_city.lower())
    ]

    if filtered.empty:
        return None

    sample = filtered.head(3)
    parts = [f"Known route data for {from_city} to {to_city} from the local workbook:"]
    price_column = _find_column(columns, COLUMN_ALIASES["price"])
    distance_column = _find_column(columns, COLUMN_ALIASES["distance_km"])
    duration_column = _find_column(columns, COLUMN_ALIASES["duration"])
    transport_column = _find_column(columns, COLUMN_ALIASES["transport_type"])

    for _, row in sample.iterrows():
        details = [f"from {from_city} to {to_city}"]
        if distance_column:
            details.append(f"distance {row[distance_column]} km")
        if transport_column:
            details.append(f"transport {row[transport_column]}")
        if duration_column:
            details.append(f"duration {row[duration_column]}")
        if price_column:
            details.append(f"price {row[price_column]} RWF")
        parts.append("- " + ", ".join(details))

    return "\n".join(parts)


def _build_model_context(message: str) -> str | None:
    route = _extract_route(message)
    distance = _extract_distance(message)
    if not route or distance is None:
        return None

    from_city, to_city = route
    transport = _extract_transport(message)
    demand = _extract_demand(message)

    try:
        from backend.predictor import predict_price
        estimate = predict_price(from_city, to_city, distance, transport, demand)
    except Exception:
        return None

    return (
        f"Local fare model estimate for {from_city} to {to_city}: "
        f"distance {distance} km, transport {transport}, demand {demand}, estimated fare {estimate} RWF."
    )


def build_travel_context(message: str) -> str:
    context_parts = []

    destination_context = _build_destination_context(message)
    if destination_context:
        context_parts.append(destination_context)

    dataset_context = _build_dataset_context(message)
    if dataset_context:
        context_parts.append(dataset_context)

    model_context = _build_model_context(message)
    if model_context:
        context_parts.append(model_context)

    return "\n\n".join(context_parts)
