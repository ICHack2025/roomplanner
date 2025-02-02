import ikea_api
import requests
import os
import base64
import zipfile
import cv2
import numpy
from colorthief import ColorThief


# Constants like country, language, base url
constants = ikea_api.Constants(country="gb", language="en")
ikea_api.Auth(constants).get_guest_token()


rotera_item = ikea_api.RoteraItem(constants)
item_code = "00404204"
rotera_item.get_item(item_code)


try:
    # Get the endpoint and execute it
    endpoint = rotera_item.get_item(item_code)
    response = ikea_api.run(endpoint)  # Run the request to get actual data
    
    model_urls = set()

    # Loop through each variation and model to create pairs
    for variation in response['variations']:
        usdz_url = None
        glb_url = None
        
        for model in variation['models']:
            # Check if the model is of format "usdz"
            if model['format'] == 'usdz':
                usdz_url = model['url']
            # Check if the model is of format "glb_draco"
            elif (model['format'] == 'glb_draco') or (model['format'] == 'glb') :
                glb_url = model['url']
            
            # If both usdz and glb URLs are found, add them as a pair to the set
            if usdz_url and glb_url:
                model_urls.add((usdz_url, glb_url))
                # Reset the URLs for the next pair
                usdz_url = None
                glb_url = None

    # Print the set of pairs
    print(model_urls)



    models_and_colors = []


    for i, model_url_pair in enumerate(model_urls):
        # print(f"\n3D Model Found: {model_url}")

        model_url_usdz = model_url_pair[0]
        model_url_glb = model_url_pair[1]

        # Download the models
        model_response_usdz = requests.get(model_url_usdz)
        model_response_glb = requests.get(model_url_glb)

        if (model_response_usdz.status_code == 200) and (model_response_glb.status_code == 200):

            model_filename_usdz = model_url_usdz.split('/')[-1]
            model_filename_glb = model_url_glb.split('/')[-1]
                
            # print(f"model filename: {model_filename}")
            with open(model_filename_usdz, "wb") as file:
                file.write(model_response_usdz.content)
            print(f"3D model saved as: {model_filename_usdz}\n")
            with open(model_filename_glb, "wb") as file:
                file.write(model_response_glb.content)
            print(f"3D model saved as: {model_filename_glb}\n")

            # FOR THE USDZ FILE
            # if ".usdz" in model_filename: 
            model_filename_zip = (f"{i}.zip"
                                    f"")  # Adjust file format if needed
            with open(model_filename_zip, "wb") as file:
                file.write(model_response_usdz.content)

            # Path to the ZIP file
            search_text = 'basecolor'

            # Open the ZIP file
            with zipfile.ZipFile(model_filename_zip, 'r') as zip_ref:
                # Iterate through the filenames in the ZIP archive
                found_files = [file_name for file_name in zip_ref.namelist() if search_text.lower() in file_name.lower()]
                
                if found_files: # Find texture with basecolor in name
                    print(f"Files containing '{search_text}':")
                    for file in found_files:
                        zip_ref.extract(file, "output_textures")
                        print(file)

                        file_path = (f"output_textures/{file}")

                        color_thief = ColorThief(file_path)
                        dominant_color = color_thief.get_color(quality=1)

                        # Dominant color of the image!
                        models_and_colors.append( (model_filename_glb, dominant_color) )

                        # print(dominant_color)
                    
                    else:
                        print(f"No files found containing '{search_text}' in their filename.")

                

                # print(f"3D model saved as: {model_filename_zip}")
                os.remove(model_filename_zip)
                # print("delete zip")
                # print("\n\n")

        else:
            print(f"Failed to download 3D model. HTTP Status: {model_response_glb.status_code}") # WHEN SOMETHING FAILS

    else:
        print("\nNo 3D model URL found in response.")

    print(models_and_colors)


except Exception as e:
    print(f"Unexpected error: {e}")

