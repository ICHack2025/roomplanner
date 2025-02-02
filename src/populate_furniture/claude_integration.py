from flask import Flask, request, jsonify, send_file
import anthropic
import ikea_api_helper as iah
import model
import os
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

messages = []

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
        #models["\\conversation"] = generate_conversation(user_prompt)

        # Return the response as JSON
        return jsonify(models)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

from flask import request

@app.route('/download', methods=['POST'])
def download_file():
    # Get the filename from the request body (assuming it's sent as JSON or form data)
    data = request.get_json()  # or request.form for form data
    print(data)
    filename = data.get('filename')

    if filename and os.path.exists(filename):
        return send_file(filename, as_attachment=True)
    else:
        return jsonify({"error": "File not found"}), 404



def get_models_from_prompts(search_queries):
    results = {}
    for key, (position, query) in search_queries.items():
        search_results = iah.ikea_search_items(query)
        for result in search_results:
            item_id = iah.get_item_model(result)
            colors = iah.get_item_colors(result)
            model_url = model.find_model(item_id, list(colors.values()))
            results[key] = (position, model_url)
            if model_url != None:
                break
    return results

def extract_text_from_textblock(text_block):
    # Extract the first TextBlock object from the list and access its 'text' field
    text = text_block[-1].text if text_block and hasattr(text_block[0], 'text') else None
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
        item, position, search_prompt = line.split(':', 2)
        item_dict[item.strip()] = (position, search_prompt.strip())  # Store the item and prompt in the dictionary
    
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
    Furthermore, for each item listed above, please asign a Position to it. Imagine these items are all to be placed in the same room and you have the option of placing each on either of the 3 following options: on the Left side of the room (left), on the Right side of the room (right) or in the Corner of the room (corner). You are a wonderfully talented interior designer, with a great reputation for making designs that are comfortable and aesthetic.
    basically, for each item, pick a Position (either left, right, or corner).

    For each item listed above, generate a search prompt **without any additional explanation**. Follow this format exactly:
    <search_prompts>
    [Item 1]: [Position (left/right/corner) for Item 1]: [Search prompt for Item 1]
    [Item 2]: [Position (left/right/corner) for Item 2]: [Search prompt for Item 2]
    [Item 3]: [Position (left/right/corner) for Item 3]: [Search prompt for Item 3]
    </search_prompts>
    
    Just list the items and their search prompts, nothing more. Ensure the prompts are specific enough that they would return the correct results on the IKEA website.
    """
    messages.append(
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": assistant_prompt
                    }
                ]
            }
        )
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1000,
        temperature=0,
        system=system_prompt,
        messages=messages
    )
    print(message.content)
    # Parse the input text
    item_search_dict = parse_search_prompts(extract_text_from_textblock(message.content))

    return item_search_dict


def generate_conversation(user_prompt):
    client = anthropic.Anthropic(api_key = "")
    system_prompt = "You are responding to a user who has just given a prompt about how they want to furnish their room."
    assistant_prompt = f"""
    You are an interior design assistant engaging in a conversation with a user about furnishing their room. The user has just provided information about how they want to furnish their room. Your task is to acknowledge their ideas and ask about additional ways they might want to furnish their space.

The user's previous response about furnishing their room is:
<previous_response>
{user_prompt}
</previous_response>

First, briefly acknowledge the user's ideas in a positive and encouraging manner. Then, ask an open-ended question about what other ways they might want to furnish or decorate their room. Your question should encourage the user to think creatively and consider aspects of the room they may not have mentioned yet.

Format your response as follows:
1. A brief acknowledgment of the user's previous ideas (1-2 sentences)
2. An open-ended question about additional furnishing or decorating ideas (1 sentence)

Write your entire response inside <response> tags. Keep your tone friendly and enthusiastic, as if you're having a conversation with the user.
    """
    messages.append(
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": assistant_prompt
                    }
                ]
            }
        )
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1000,
        temperature=0,
        system=system_prompt,
        messages= messages
    )
    return extract_text_from_textblock(message.content)

if __name__ == '__main__':
    app.run(debug=True)