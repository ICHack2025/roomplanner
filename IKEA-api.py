import ikea_api
import requests
from pygltflib import GLTF2
import trimesh
import os
import base64

# Constants like country, language, base url
constants = ikea_api.Constants(country="gb", language="en")
# Search API
search = ikea_api.Search(constants)
# Search endpoint with prepared data
endpoint = search.search(
    "Black Coffee Table",
    limit=1,
    types=["PRODUCT"]
)
# print(ikea_api.run(endpoint))
# ?????
ikea_api.Auth(constants).get_guest_token()

ingka_items = ikea_api.IngkaItems(constants)
#print(ingka_items.get_items(["30457903"]))

pip_item = ikea_api.PipItem(constants)
#print(pip_item.get_item(["30457903"]))

rotera_item = ikea_api.RoteraItem(constants)
rotera_item.get_item("00404204")

item_code = "00404204"

try:
    # Get the endpoint and execute it
    endpoint = rotera_item.get_item(item_code)
    response = ikea_api.run(endpoint)  # Run the request to get actual data

    #print("Response Data:", response)  # Inspect the JSON response

    # Attempt to find the 3D model URL in response
    print(response)
    model_urls = []
    for item in response.get("models"):
        cur_url = item.get("url")
        if ".glb" in cur_url:
            model_urls.append(item.get("url"))
    for variation in response.get("variations"):
        for item in variation.get("models"):
            cur_url = item.get("url")
            if ".glb" in cur_url:
                model_urls.append(item.get("url"))
    print(model_urls[0])
    for i, model_url in enumerate(model_urls):
        print(f"3D Model Found: {model_urls[0]}")

        # Download the model
        model_response = requests.get(model_urls[0])

        if model_response.status_code == 200:
            model_filename = (f"{i}.glb"
                              f"")  # Adjust file format if needed
            with open(model_filename, "wb") as file:
                file.write(model_response.content)
            print(f"3D model saved as: {model_filename}")
        else:
            print(f"Failed to download 3D model. HTTP Status: {model_response.status_code}")

    else:
        print("No 3D model URL found in response.")

except Exception as e:
    print(f"Unexpected error: {e}")

for i in range(len(model_urls)):

    # Load the GLB file
    mesh = trimesh.load_mesh(f'{i}.glb')

    # Get the textures from the GLB
    textures = mesh.visual.material.textures

    # Save textures as images (optional)
    if textures:
        for idx, texture in enumerate(textures):
            # Extract and save texture as image
            image = texture.image
            image.save(f"texture_{idx}.png")
            print(f"Saved texture_{idx}.png")
    else:
        print("No textures found.")

print(model_urls)