import ikea_api
import requests
import os
import base64
import zipfile
# import cv2
import numpy

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
item_code = "00404204"
rotera_item.get_item(item_code)


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
        if ".usdz" in cur_url:
            model_urls.append(item.get("url"))
    for variation in response.get("variations"):
        for item in variation.get("models"):
            cur_url = item.get("url")
            if ".usdz" in cur_url:
                model_urls.append(item.get("url"))
    print(model_urls[0])
    for i, model_url in enumerate(model_urls):
        print(f"3D Model Found: {model_url}")

        # Download the model
        model_response = requests.get(model_url)

        if model_response.status_code == 200:
            model_filename_usdz = (f"{i}.usdz"
                                   f"")  # Adjust file format if needed
            with open(model_filename_usdz, "wb") as file:
                file.write(model_response.content)
            print(f"3D model saved as: {model_filename_usdz}")

            
            model_filename_zip = (f"{i}.zip"
                                  f"")  # Adjust file format if needed
            with open(model_filename_zip, "wb") as file:
                file.write(model_response.content)

            # Path to the ZIP file
            search_text = 'basecolor'

            # Open the ZIP file
            with zipfile.ZipFile(model_filename_zip, 'r') as zip_ref:
                # Iterate through the filenames in the ZIP archive
                found_files = [file_name for file_name in zip_ref.namelist() if search_text.lower() in file_name.lower()]
                
                if found_files:
                    print(f"Files containing '{search_text}':")
                    for file in found_files:
                        zip_ref.extract(file, "output_textures")
                        print(file)
                else:
                    print(f"No files found containing '{search_text}' in their filename.")

            

            print(f"3D model saved as: {model_filename_zip}")
            os.remove(model_filename_zip)
            print("delete zip")


            # myimg = cv2.imread('image.jpg')
            # avg_color_per_row = numpy.average(myimg, axis=0)
            # avg_color = numpy.average(avg_color_per_row, axis=0)
            # print(avg_color)


            print("\n\n")

        else:
            print(f"Failed to download 3D model. HTTP Status: {model_response.status_code}")

    else:
        print("No 3D model URL found in response.")

except Exception as e:
    print(f"Unexpected error: {e}")

