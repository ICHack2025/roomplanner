import ikea_api
import requests
from pygltflib import GLTF2
import base64


def extract_base_color(glb_path):
    gltf = GLTF2().load(glb_path)

    colors = []
    for material in gltf.materials:
        if material.pbrMetallicRoughness:
            pbr = material.pbrMetallicRoughness
            if pbr.baseColorFactor:  # [R, G, B, A]
                colors.append(tuple(pbr.baseColorFactor[:3]))  # Only RGB
    return colors

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
    glb_file = f"{i}.glb"  # Replace with your file path
    glb = GLTF2().load(glb_file)

    # Extract texture data
    for texture in glb.textures:
        image_index = texture.source
        image_data = glb.images[image_index].uri

        # If the image is embedded, decode it
        if image_data.startswith("data:image"):
            # Extract the base64 encoded image
            base64_data = image_data.split(",")[1]
            file_name = f"texture_{image_index}.png"

            # Write the texture file
            with open(file_name, "wb") as file:
                file.write(base64.b64decode(base64_data))
        else:
            print(f"Image {image_index} is a URI: {image_data}")

print(model_urls)