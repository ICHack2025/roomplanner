from flask import Flask, request, jsonify, send_file, CORS
import anthropic
import ikea_api_helper as iah
import model
import os


app = Flask(__name__)
CORS(app)


@app.route('/chat', methods=['POST'])
def chat():
    # Get the user's message from the request
    data = request.json
    user_prompt = data.get("message")

    if not user_prompt:
        return jsonify({"error": "No message provided"}), 400

    try:
        # Send the message to Claude
        search_queries = generate_queries(user_prompt)
        models = get_models_from_prompts(search_queries)

        # Return the response as JSON
        return jsonify(models)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    # file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if os.path.exists(filename):
        return send_file(filename, as_attachment=True)
    else:
        return jsonify({"error": "File not found"}), 404


def get_models_from_prompts(search_queries):
    results = {}
    for key, query in search_queries.items():
        search_results = iah.ikea_search_items(query)
        for result in search_results:
            item_id = iah.get_item_model(result)
            colors = iah.get_item_colors(result)
            model_filename = model.find_model(item_id, list(colors.values()))
            results[key] = model_filename
            if model_filename != None:
                break
    return results

def extract_text_from_textblock(text_block):
    # Extract the first TextBlock object from the list and access its 'text' field
    text = text_block[0].text if text_block and hasattr(text_block[0], 'text') else None
    return text

# Function to extract items and search prompts into a dictionary
def parse_search_prompts(text):
    # Remove the <search_prompts> tags from the input text
    search_prompts_section = text.strip().replace("<search_prompts>", "").replace("</search_prompts>", "").strip()
    
    # Initialize an empty dictionary
    item_dict = {}
    
    # Split the text into lines
    lines = search_prompts_section.split('\n')
    
    # Loop through each line and extract item and search prompt
    for line in lines:
        # Split the line by the first colon to separate the item and search prompt
        item, search_prompt = line.split(':', 1)
        item_dict[item.strip()] = search_prompt.strip()  # Store the item and prompt in the dictionary
    
    return item_dict

def generate_queries(user_prompt):
    client = anthropic.Anthropic(api_key = "")

    # Prepare the assistant prompt
    system_prompt = "You are an expert assistant who provides clear, concise answers."
    assistant_prompt = f"""
    {user_prompt}
    
    You are tasked with creating search prompts for the text above as if searching on the IKEA website. The goal is to create search prompts for the items that the user has described, and these prompts should return relevant results directly on the IKEA website's search page.
    
    Guidelines for creating search prompts:
    - Use a MAXIMUM of 1 adjective, and it must be a suitable color.
    - Include the furniture name.
    
    The items to search for are:
    <items>
    {{items}}
    </items>
    
    For each item listed above, generate a search prompt that would be suitable for finding the items the user mentioned on the IKEA website. Be creative in combining the elements the user mentioned with IKEA's typical style.
    
    For each item listed above, generate a search prompt **without any additional explanation**. Follow this format exactly:
    <search_prompts>
    [Item 1]: [Search prompt for Item 1]
    [Item 2]: [Search prompt for Item 2]
    [Item 3]: [Search prompt for Item 3]
    </search_prompts>
    
    Just list the items and their search prompts, nothing more. Ensure the prompts are specific enough that they would return the correct results on the IKEA website.
    """
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1000,
        temperature=0,
        system=system_prompt,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": assistant_prompt
                    }
                ]
            }
        ]
    )

    # Parse the input text
    item_search_dict = parse_search_prompts(extract_text_from_textblock(message.content))

    return item_search_dict



if __name__ == '__main__':
    app.run(debug=True)