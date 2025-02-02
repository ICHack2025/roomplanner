import ikea_api
import requests
from pygltflib import GLTF2
import base64

def ikea_search_items(query):
    result = []
    # Constants like country, language, base url
    constants = ikea_api.Constants(country="gb", language="en")
    # Search API
    search = ikea_api.Search(constants)
    # Search endpoint with prepared data
    endpoint = search.search(
        query=query,
        limit=2,
        types=["PRODUCT"]
    )
    response = ikea_api.run(endpoint)
    items = response.get("searchResultPage").get("products").get("main").get("items")
    print(f"Items for {query}")
    print(f"Found {len(items)} items for {query}")
    print(items)
    result.extend(items)
    return result

def get_item_model(item):
    constants = ikea_api.Constants(country="gb", language="en")
    rotera_item = ikea_api.RoteraItem(constants)
    potential_ids = [item.get("metadata").split(";")[3]]
    item = item.get("product")
    potential_ids.append(item.get("id"))
    potential_ids.append(item.get("itemNoGlobal"))
    for variant in item.get("gprDescription").get("variants"):
        potential_ids.append(variant.get("id"))
    print(f"Attempting item lookup for ids {potential_ids}")
    for pot_id in potential_ids:
        if pot_id is None:
            continue
        while pot_id[0] not in "0123456789":
            pot_id = pot_id[1:]
        endpoint = rotera_item.get_item(pot_id)
        try:
            response = ikea_api.run(endpoint)
            return pot_id
        except:
            continue
    return None

def get_item_colors(item):
    colors = {}
    item_clrs = item.get("product").get("colors")
    for color in item_clrs:
        colors[color.get("name")] = color.get("hex")
    return colors

